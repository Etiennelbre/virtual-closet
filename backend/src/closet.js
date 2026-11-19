// The virtual closet: save, list, correct and delete clothes.
// Item data goes in DynamoDB, the photo goes in the private S3 bucket.

import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { analysePhoto, CATEGORIES, COLOURS } from './rekognition.js';

const TABLE = process.env.TABLE_NAME;
const BUCKET = process.env.BUCKET_NAME;
const MAX_PHOTO_BYTES = 1024 * 1024; // 1 MB (the browser already resizes the photo)

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

// POST /items - save a new photo, analyse it, store the item.
export async function addItem(userId, imageBase64) {
  if (!imageBase64) fail(400, 'Missing photo (imageBase64)');
  const bytes = Buffer.from(imageBase64, 'base64');
  if (bytes.length === 0) fail(400, 'The photo is empty');
  if (bytes.length > MAX_PHOTO_BYTES) fail(400, 'The photo is too big (max 1 MB)');

  const itemId = randomUUID();
  const photoKey = `${userId}/${itemId}.jpg`; // each user has their own "folder"

  // 1. Save the photo in the private bucket
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: photoKey, Body: bytes, ContentType: 'image/jpeg',
  }));

  // 2. Ask the AI what it is
  const ai = await analysePhoto(bytes);

  // 3. Save the item in DynamoDB
  const item = {
    userId,
    itemId,
    category: ai.category,
    colour: ai.colour,
    confidence: ai.confidence,
    aiSource: ai.source, // "rekognition" or "simulated"
    photoKey,
    createdAt: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: TABLE, Item: item }));

  return withPhotoUrl(item);
}

// GET /items - all my items, newest first, each with a temporary photo link.
export async function listItems(userId) {
  const result = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'userId = :u', // only MY items
    ExpressionAttributeValues: { ':u': userId },
  }));
  const items = result.Items || [];
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.all(items.map(withPhotoUrl));
}

// PUT /items/{id} - the user corrects the category or the colour.
export async function updateItem(userId, itemId, changes) {
  const { category, colour } = changes;
  if (!CATEGORIES.includes(category)) fail(400, `Category must be one of: ${CATEGORIES.join(', ')}`);
  if (!COLOURS.includes(colour)) fail(400, `Colour must be one of: ${COLOURS.join(', ')}`);

  try {
    const result = await db.send(new UpdateCommand({
      TableName: TABLE,
      Key: { userId, itemId },
      UpdateExpression: 'SET category = :c, colour = :col',
      ConditionExpression: 'attribute_exists(itemId)', // do not create a new item by mistake
      ExpressionAttributeValues: { ':c': category, ':col': colour },
      ReturnValues: 'ALL_NEW',
    }));
    return withPhotoUrl(result.Attributes);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') fail(404, 'Item not found');
    throw err;
  }
}

// DELETE /items/{id} - remove the item and its photo.
export async function deleteItem(userId, itemId) {
  const result = await db.send(new DeleteCommand({
    TableName: TABLE,
    Key: { userId, itemId },
    ReturnValues: 'ALL_OLD',
  }));
  if (!result.Attributes) fail(404, 'Item not found');
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: result.Attributes.photoKey }));
}

// The bucket is private, so the browser gets a link that works for 15 minutes only.
async function withPhotoUrl(item) {
  const photoUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: item.photoKey }),
    { expiresIn: 15 * 60 },
  );
  return { ...item, photoUrl };
}

// Stops the request with an error message for the user (see index.js).
function fail(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}
