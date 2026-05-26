import { Client, Account, Databases } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!projectId) {
  console.warn('Warning: NEXT_PUBLIC_APPWRITE_PROJECT_ID is not configured in environment variables.');
}

export const client = new Client();
client
  .setEndpoint(endpoint)
  .setProject(projectId || '');

export const account = new Account(client);
export const databases = new Databases(client);
