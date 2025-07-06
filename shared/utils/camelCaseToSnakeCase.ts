/**
 * Convert camelCase to snake_case
 * @example
 * camelCaseToSnakeCase('camelCase') // 'camel_case'
 */
const camelCaseToSnakeCase = (str: string): string =>
    str.trim() // Remove leading and trailing whitespace
        .replace(/[^a-zA-Z0-9]+/g, '_') // Replace non-alphanumeric characters with underscores
        .replace(/([a-z][^A-Z]*?)([A-Z])/g, '$1_$2') // Insert underscore between lowercase and uppercase letters
        .replace(/([A-Z])([A-Z][^A-Z]*?)/g, '$1_$2') // Insert underscore between two uppercase letters
        .replace(/_+/g, '_') // replace multiple underscores with a single underscore
        .toLowerCase() // Convert the entire string to lowercase

export { camelCaseToSnakeCase }
