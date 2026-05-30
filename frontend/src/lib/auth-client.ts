import { createAuthClient } from "better-auth/react";

// In dev, it uses localhost:5173. In prod, it uses your vercel domain.
// Vercel routes the requests to Render automatically behind the scenes!
const authBaseURL = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  advanced: {
    disableStateCheck: true, 
  }
});

export const { signIn, signUp, signOut, useSession } = authClient;