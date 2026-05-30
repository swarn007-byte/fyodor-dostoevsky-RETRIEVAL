import { AuthorizeResponse, createAccessControl } from "./access.mjs";
import { LiteralString } from "@better-auth/core";

//#region src/plugins/access/types.d.ts
type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;
type SubArray<T extends unknown[] | readonly unknown[] | any[]> = T[number][] | ReadonlyArray<T[number]>;
type Subset<K extends keyof R, R extends Record<string | LiteralString, readonly string[] | readonly LiteralString[]>> = { [P in K]: SubArray<R[P]> };
type Statements = {
  readonly [resource: string]: readonly LiteralString[];
};
type RoleStatements<TStatements extends Statements> = { readonly [P in keyof TStatements]?: SubArray<TStatements[P]> };
type RoleInput<TStatements extends Statements, TRoleStatements extends Statements> = TRoleStatements & (string extends keyof TRoleStatements ? {} : RoleStatements<TStatements> & Record<Exclude<keyof TRoleStatements, keyof TStatements>, never>);
type ExactRoleStatements<TStatements extends Statements> = { readonly [P in keyof TStatements]: readonly [...TStatements[P]] };
type AccessControl<TStatements extends Statements = Statements> = ReturnType<typeof createAccessControl<TStatements>>;
type RoleAuthorizeRequest<TStatements extends Statements> = { [P in keyof TStatements]?: SubArray<TStatements[P]> | {
  actions: SubArray<TStatements[P]>;
  connector: "OR" | "AND";
} };
type Role<TRoleStatements extends Statements = Record<string, any>, TAuthorizeStatements extends Statements = TRoleStatements> = {
  authorize: (request: RoleAuthorizeRequest<TAuthorizeStatements>, connector?: ("OR" | "AND") | undefined) => AuthorizeResponse;
  statements: TRoleStatements;
};
//#endregion
export { AccessControl, ArrayElement, ExactRoleStatements, Role, RoleAuthorizeRequest, RoleInput, RoleStatements, Statements, SubArray, Subset };