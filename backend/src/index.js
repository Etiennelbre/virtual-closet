// The Lambda function behind every API route.
// API Gateway has already checked the Cognito token before we get here.
// This file is only a router: it looks at the route and calls the right module.

import { addItem, listItems, updateItem, deleteItem } from './closet.js';
import { getWeather } from './weather.js';
import { pickOutfit } from './outfit.js';

export async function handler(event) {
  // SECURITY: the user id ALWAYS comes from the token checked by API Gateway
  // ("sub" = the unique Cognito id of the logged-in user).
  // We never read a user id sent by the browser, because anyone could change it
  // and then read or delete another student's clothes.
  const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
  if (!userId) {
    return reply(401, { error: 'Not logged in' });
  }

  const itemId = event.pathParameters?.id;

  try {
    // routeKey is "METHOD /path", for example "PUT /items/{id}"
    switch (event.routeKey) {
      case 'POST /items': {
        const body = readBody(event);
        return reply(201, await addItem(userId, body.imageBase64));
      }
      case 'GET /items':
        return reply(200, await listItems(userId));

      case 'PUT /items/{id}':
        return reply(200, await updateItem(userId, itemId, readBody(event)));

      case 'DELETE /items/{id}':
        await deleteItem(userId, itemId);
        return reply(200, { deleted: itemId });

      case 'GET /outfit': {
        const city = event.queryStringParameters?.city || 'Dublin';
        const weather = await getWeather(city);
        const items = await listItems(userId);
        const outfit = pickOutfit(items, weather);
        return reply(200, { weather, items: outfit.items, explanation: outfit.explanation });
      }
      default:
        return reply(404, { error: 'Unknown route' });
    }
  } catch (err) {
    // Errors we expected have a statusCode (for example 400 or 404).
    // Anything else is a bug: log it in CloudWatch, hide the details from the user.
    if (err.statusCode) {
      return reply(err.statusCode, { error: err.message });
    }
    console.error(err);
    return reply(500, { error: 'Something went wrong on the server' });
  }
}

// Turns the JSON body of the request into an object.
function readBody(event) {
  if (!event.body) return {};
  const text = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error('The request body is not valid JSON');
    err.statusCode = 400;
    throw err;
  }
}

// Builds the answer sent back to the browser.
// (CORS headers are added by API Gateway, see template.yaml.)
function reply(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}
