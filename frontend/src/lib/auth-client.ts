import { createAuthClient } from "better-auth/react";

const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

const authBaseURL = import.meta.env.DEV
  ? typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5173"
  : apiBase;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  // ADD THIS BLOCK: Disables strict cookie state validation 
  // only while testing on localhost
  advanced: {
    disableStateCheck: true, 
  }
});

export const { signIn, signUp, signOut, useSession } = authClient;