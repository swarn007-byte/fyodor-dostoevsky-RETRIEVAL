import { ExactRoleStatements, Role, RoleInput, Statements } from "../../access/types.mjs";
//#region src/plugins/organization/access/statement.d.ts
declare const defaultStatements: {
  readonly organization: readonly ["update", "delete"];
  readonly member: readonly ["create", "update", "delete"];
  readonly invitation: readonly ["create", "cancel"];
  readonly team: readonly ["create", "update", "delete"];
  readonly ac: readonly ["create", "read", "update", "delete"];
};
declare const defaultAc: {
  newRole<const TRoleStatements extends Statements>(statements: RoleInput<{
    readonly organization: readonly ["update", "delete"];
    readonly member: readonly ["create", "update", "delete"];
    readonly invitation: readonly ["create", "cancel"];
    readonly team: readonly ["create", "update", "delete"];
    readonly ac: readonly ["create", "read", "update", "delete"];
  }, TRoleStatements>): Role<ExactRoleStatements<TRoleStatements>, {
    readonly organization: readonly ["update", "delete"];
    readonly member: readonly ["create", "update", "delete"];
    readonly invitation: readonly ["create", "cancel"];
    readonly team: readonly ["create", "update", "delete"];
    readonly ac: readonly ["create", "read", "update", "delete"];
  }>;
  statements: {
    readonly organization: readonly ["update", "delete"];
    readonly member: readonly ["create", "update", "delete"];
    readonly invitation: readonly ["create", "cancel"];
    readonly team: readonly ["create", "update", "delete"];
    readonly ac: readonly ["create", "read", "update", "delete"];
  };
};
declare const adminAc: Role<ExactRoleStatements<{
  readonly organization: ["update"];
  readonly invitation: ["create", "cancel"];
  readonly member: ["create", "update", "delete"];
  readonly team: ["create", "update", "delete"];
  readonly ac: ["create", "read", "update", "delete"];
}>, {
  readonly organization: readonly ["update", "delete"];
  readonly member: readonly ["create", "update", "delete"];
  readonly invitation: readonly ["create", "cancel"];
  readonly team: readonly ["create", "update", "delete"];
  readonly ac: readonly ["create", "read", "update", "delete"];
}>;
declare const ownerAc: Role<ExactRoleStatements<{
  readonly organization: ["update", "delete"];
  readonly member: ["create", "update", "delete"];
  readonly invitation: ["create", "cancel"];
  readonly team: ["create", "update", "delete"];
  readonly ac: ["create", "read", "update", "delete"];
}>, {
  readonly organization: readonly ["update", "delete"];
  readonly member: readonly ["create", "update", "delete"];
  readonly invitation: readonly ["create", "cancel"];
  readonly team: readonly ["create", "update", "delete"];
  readonly ac: readonly ["create", "read", "update", "delete"];
}>;
declare const memberAc: Role<ExactRoleStatements<{
  readonly organization: [];
  readonly member: [];
  readonly invitation: [];
  readonly team: [];
  readonly ac: ["read"];
}>, {
  readonly organization: readonly ["update", "delete"];
  readonly member: readonly ["create", "update", "delete"];
  readonly invitation: readonly ["create", "cancel"];
  readonly team: readonly ["create", "update", "delete"];
  readonly ac: readonly ["create", "read", "update", "delete"];
}>;
declare const defaultRoles: {
  admin: Role<ExactRoleStatements<{
    readonly organization: ["update"];
    readonly invitation: ["create", "cancel"];
    readonly member: ["create", "update", "delete"];
    readonly team: ["create", "update", "delete"];
    readonly ac: ["create", "read", "update", "delete"];
  }>, {
    readonly organization: readonly ["update", "delete"];
    readonly member: readonly ["create", "update", "delete"];
    readonly invitation: readonly ["create", "cancel"];
    readonly team: readonly ["create", "update", "delete"];
    readonly ac: readonly ["create", "read", "update", "delete"];
  }>;
  owner: Role<ExactRoleStatements<{
    readonly organization: ["update", "delete"];
    readonly member: ["create", "update", "delete"];
    readonly invitation: ["create", "cancel"];
    readonly team: ["create", "update", "delete"];
    readonly ac: ["create", "read", "update", "delete"];
  }>, {
    readonly organization: readonly ["update", "delete"];
    readonly member: readonly ["create", "update", "delete"];
    readonly invitation: readonly ["create", "cancel"];
    readonly team: readonly ["create", "update", "delete"];
    readonly ac: readonly ["create", "read", "update", "delete"];
  }>;
  member: Role<ExactRoleStatements<{
    readonly organization: [];
    readonly member: [];
    readonly invitation: [];
    readonly team: [];
    readonly ac: ["read"];
  }>, {
    readonly organization: readonly ["update", "delete"];
    readonly member: readonly ["create", "update", "delete"];
    readonly invitation: readonly ["create", "cancel"];
    readonly team: readonly ["create", "update", "delete"];
    readonly ac: readonly ["create", "read", "update", "delete"];
  }>;
};
//#endregion
export { adminAc, defaultAc, defaultRoles, defaultStatements, memberAc, ownerAc };