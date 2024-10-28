/*
 * Convert a camelCase string to a Title Case string.
 * @example
 * camelCaseToTitle('camelCaseString'); // 'Camel Case String'
 */
export default (str: string) =>
    str.trim() // Remove leading and trailing whitespace
        .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter