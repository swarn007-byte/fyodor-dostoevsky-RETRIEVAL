//#region src/utils/string.d.ts
declare function capitalizeFirstLetter(str: string): string;
declare function toSnakeCase(input: string): string;
declare function toKebabCase(input: string): string;
declare function toCamelCase(input: string): string;
declare function toPascalCase(input: string): string;
//#endregion
export { capitalizeFirstLetter, toCamelCase, toKebabCase, toPascalCase, toSnakeCase };