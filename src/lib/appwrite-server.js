import { Client, Databases } from 'node-appwrite';

/**
 * Creates an admin Appwrite client with server-level access.
 * This is used for backend operations (e.g., verifying credentials
 * against the custom database collection) that require API key privileges.
 */
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

  const apiKey = process.env.APPWRITE_API_KEY;
  if (apiKey) {
    client.setKey(apiKey);
  } else {
    console.warn(
      'Warning: APPWRITE_API_KEY is not configured. Queries to protected collections will fail unless public read access is enabled.'
    );
  }

  return {
    get databases() {
      return new Databases(client);
    },
  };
}
