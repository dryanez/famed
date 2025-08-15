import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "687e890e3a2296d07bac8718", 
  requiresAuth: true, // Ensure authentication is required for all operations
  callbackUrl: window.location.origin // Use current domain dynamically
});
