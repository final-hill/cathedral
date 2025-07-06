/**
 * Convert a camelCase string to a Title Case string.
 * @example
 * camelCaseToTitleCase('camelCaseString'); // 'Camel Case String'
 */
const camelCaseToTitleCase = (str: string) =>
    str.trim() // Remove leading and trailing whitespace
        .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter

export { camelCaseToTitleCase }
