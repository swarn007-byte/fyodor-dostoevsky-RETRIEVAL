import axios from "axios";
import { getApiBase } from "../lib/api-base";
import { getGuestId } from "../lib/guest-id";
import { getSessionToken } from "../lib/auth-client";

export const api = axios.create({
  baseURL: getApiBase(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  config.headers.set("x-guest-id", getGuestId());
  const token = getSessionToken();
  if (token) config.headers.set("x-session-token", token);
  return config;
});
