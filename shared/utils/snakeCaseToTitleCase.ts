/**
 * Convert snake_case to Title Case
 * @example
 * snakeCaseToTitleCase('snake_case_string'); // 'Snake Case String'
 */
const snakeCaseToTitleCase = (str: string) =>
    str.replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())

export { snakeCaseToTitleCase }
