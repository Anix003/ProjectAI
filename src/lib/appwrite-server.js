import { Client, Account, Databases, Storage, Users } from 'node-appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

export function createAdminClient() {
  if (!projectId || !apiKey) {
    throw new Error('Missing Appwrite configuration. Verify NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY in environment.');
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    get account() { return new Account(client); },
    get databases() { return new Databases(client); },
    get storage() { return new Storage(client); },
    get users() { return new Users(client); }
  };
}

export function createSessionClient(sessionCookieValue) {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  if (sessionCookieValue) {
    client.setSession(sessionCookieValue);
  }

  return {
    get account() { return new Account(client); },
    get databases() { return new Databases(client); },
    get storage() { return new Storage(client); }
  };
}
