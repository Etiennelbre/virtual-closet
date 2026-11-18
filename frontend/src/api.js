// One small helper for every call to our API.
// It adds the Cognito ID token so API Gateway knows who the user is.
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Example: await callApi('GET', '/items')
export async function callApi(method, path, body) {
  const session = await fetchAuthSession(); // refreshes the token if it expired
  const token = session.tokens?.idToken?.toString();

  const response = await fetch(API_URL + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}
