import retrieveRefreshToken from "@/actions/auth/retrieveRefreshToken";
import storeRefreshToken from "@/actions/auth/storeRefreshToken";
import { defineOneEntry } from "oneentry";

export type ApiClientType = ReturnType<typeof defineOneEntry> | null;

let apiClient: ApiClientType = null;

async function setupApiClient(): Promise<ReturnType<typeof defineOneEntry>> {
  // Retrieve the API URL from environment variables
  const apiUrl = process.env.ONEENTRY_PROJECT_URL;

  // Throw an error if the API URL is not defined
  if (!apiUrl) {
    throw new Error('ONEENTRY_PROJECT_URL is missing');
  }

  // Check if the API client is already initialized
  if (!apiClient) {
    try {
      // Retrieve the refresh token (if available) from storage
      const refreshToken = await retrieveRefreshToken();

      // Create a new instance of the API client with the required configuration
      apiClient = defineOneEntry(apiUrl, {
        token: process.env.ONENETRY_TOKEN, // Token for authentication
        langCode: 'en_US', // Language code for the API
        auth: {
          refreshToken: refreshToken || undefined, // Use the retrieved refresh token or `undefined`
          customAuth: false, // Disable custom authentication
          saveFunction: async (newToken: string) => {
            // Save the new refresh token when it is updated
            await storeRefreshToken(newToken);
          },
        },
      });
    } catch (error) {
      // Log an error if there is an issue retrieving the refresh token
      console.error('Error fetching refresh token:', error);
    }
  }

  // If the API client is still not initialized, throw an error
  if (!apiClient) {
    throw new Error('Failed to initialize API client');
  }

  // Return the initialized API client
  return apiClient;
}