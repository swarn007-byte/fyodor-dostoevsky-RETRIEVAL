import { ExactRoleStatements, Role, RoleInput, Statements } from "./types.mjs";

//#region src/plugins/access/access.d.ts
type AuthorizeResponse = {
  success: false;
  error: string;
} | {
  success: true;
  error?: never | undefined;
};
declare function role<const TRoleStatements extends Statements, TAuthorizeStatements extends Statements = TRoleStatements>(statements: TRoleStatements): Role<ExactRoleStatements<TRoleStatements>, TAuthorizeStatements>;
declare function createAccessControl<const TStatements extends Statements>(s: TStatements): {
  newRole<const TRoleStatements extends Statements>(statements: RoleInput<TStatements, TRoleStatements>): Role<ExactRoleStatements<TRoleStatements>, TStatements>;
  statements: TStatements;
};
//#endregion
export { AuthorizeResponse, createAccessControl, role };