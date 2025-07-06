/**
 * Convert camelCase string to slug
 * @example
 * camelCaseToSlug('camelCase') // 'camel-case'
 */
const camelCaseToSlug = (input: string): string =>
    input.trim() // Remove leading and trailing whitespace
        .replace(/[^a-zA-Z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
        .replace(/([a-z][^A-Z]*?)([A-Z])/g, '$1-$2') // Insert hyphen between lowercase and uppercase letters
        .replace(/([A-Z])([A-Z][^A-Z]*?)/g, '$1-$2') // Insert hyphen between two uppercase letters
        .replace(/-+/g, '-') // replace multiple hyphens with a single hyphen
        .toLowerCase() // Convert the entire string to lowercase

export { camelCaseToSlug }
