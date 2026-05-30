import { ExactRoleStatements, Role, RoleInput, Statements } from "../../access/types.mjs";
//#region src/plugins/admin/access/statement.d.ts
declare const defaultStatements: {
  readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
  readonly session: readonly ["list", "revoke", "delete"];
};
declare const defaultAc: {
  newRole<const TRoleStatements extends Statements>(statements: RoleInput<{
    readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
    readonly session: readonly ["list", "revoke", "delete"];
  }, TRoleStatements>): Role<ExactRoleStatements<TRoleStatements>, {
    readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
    readonly session: readonly ["list", "revoke", "delete"];
  }>;
  statements: {
    readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
    readonly session: readonly ["list", "revoke", "delete"];
  };
};
declare const adminAc: Role<ExactRoleStatements<{
  readonly user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"];
  readonly session: ["list", "revoke", "delete"];
}>, {
  readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
  readonly session: readonly ["list", "revoke", "delete"];
}>;
declare const userAc: Role<ExactRoleStatements<{
  readonly user: [];
  readonly session: [];
}>, {
  readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
  readonly session: readonly ["list", "revoke", "delete"];
}>;
declare const defaultRoles: {
  admin: Role<ExactRoleStatements<{
    readonly user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"];
    readonly session: ["list", "revoke", "delete"];
  }>, {
    readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
    readonly session: readonly ["list", "revoke", "delete"];
  }>;
  user: Role<ExactRoleStatements<{
    readonly user: [];
    readonly session: [];
  }>, {
    readonly user: readonly ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "get", "update"];
    readonly session: readonly ["list", "revoke", "delete"];
  }>;
};
//#endregion
export { adminAc, defaultAc, defaultRoles, defaultStatements, userAc };