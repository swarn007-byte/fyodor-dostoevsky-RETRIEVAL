import { Account, Session as Session$1, User as User$1 } from "../types/models.mjs";
import { BetterAuthOptions } from "@better-auth/core";
import { BetterAuthPluginDBSchema, DBFieldAttribute } from "@better-auth/core/db";

//#region src/db/schema.d.ts
declare function parseUserOutput<T extends User$1>(options: BetterAuthOptions, user: T): T;
/**
 * Builds a synthetic user object that matches the shape of a real user
 * returned from the database. This ensures enumeration protection works
 * correctly by making synthetic and real user responses indistinguishable.
 *
 * The function iterates over the user output schema and:
 * - Includes all fields that should be returned (returned !== false)
 * - Uses provided values when available
 * - Sets optional fields to null when no value is provided
 * - Applies default values where defined
 * - Always includes the 'id' field (not part of schema but always present)
 */
declare function buildSyntheticUserOutput(options: BetterAuthOptions, data: Record<string, unknown>): Record<string, unknown>;
declare function parseSessionOutput<T extends Session$1>(options: BetterAuthOptions, session: T): T;
declare function parseAccountOutput<T extends Account>(options: BetterAuthOptions, account: T): Omit<T, "idToken" | "accessToken" | "refreshToken" | "password" | "accessTokenExpiresAt" | "refreshTokenExpiresAt">;
declare function parseInputData<T extends Record<string, any>>(data: T, schema: {
  fields: Record<string, DBFieldAttribute>;
  action?: ("create" | "update") | undefined;
}): Partial<T>;
declare function parseUserInput(options: BetterAuthOptions, user: Record<string, any> | undefined, action: "create" | "update"): Partial<Record<string, any>>;
declare function parseAdditionalUserInput(options: BetterAuthOptions, user?: Record<string, any> | undefined): Partial<Record<string, any>>;
declare function parseAccountInput(options: BetterAuthOptions, account: Partial<Account>): Partial<Partial<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  providerId: string;
  accountId: string;
  userId: string;
  accessToken?: string | null | undefined;
  refreshToken?: string | null | undefined;
  idToken?: string | null | undefined;
  accessTokenExpiresAt?: Date | null | undefined;
  refreshTokenExpiresAt?: Date | null | undefined;
  scope?: string | null | undefined;
  password?: string | null | undefined;
}>>;
declare function parseSessionInput(options: BetterAuthOptions, session: Partial<Session$1>, action?: "create" | "update"): Partial<Partial<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}>>;
declare function getSessionDefaultFields(options: BetterAuthOptions): Record<string, any>;
declare function mergeSchema<S extends BetterAuthPluginDBSchema>(schema: S, newSchema?: { [K in keyof S]?: {
  modelName?: string | undefined;
  fields?: {
    [P: string]: string;
  } | undefined;
} | undefined } | undefined): S;
//#endregion
export { buildSyntheticUserOutput, getSessionDefaultFields, mergeSchema, parseAccountInput, parseAccountOutput, parseAdditionalUserInput, parseInputData, parseSessionInput, parseSessionOutput, parseUserInput, parseUserOutput };