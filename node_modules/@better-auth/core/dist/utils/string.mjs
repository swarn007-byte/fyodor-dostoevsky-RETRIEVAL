//#region src/utils/string.ts
function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
const WORD_PATTERN = /[\p{Ll}\d]+|\p{Lu}+(?!\p{Ll})|\p{Lu}[\p{Ll}\d]+|\p{Lo}+/gu;
const APOSTROPHE_PATTERN = /['\u2019]/g;
function splitWords(input) {
	return input.replace(APOSTROPHE_PATTERN, "").match(WORD_PATTERN) ?? [];
}
function toSnakeCase(input) {
	return splitWords(input).map((word) => word.toLowerCase()).join("_");
}
function toKebabCase(input) {
	return splitWords(input).map((word) => word.toLowerCase()).join("-");
}
function toCamelCase(input) {
	return splitWords(input).reduce((acc, word, i) => {
		return acc + (i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`);
	}, "");
}
function toPascalCase(input) {
	return splitWords(input).map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join("");
}
//#endregion
export { capitalizeFirstLetter, toCamelCase, toKebabCase, toPascalCase, toSnakeCase };
