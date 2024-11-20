/**
 * Convert snake_case to Title Case
 * @example
 * snakeCaseToTitle('snake_case_string'); // 'Snake Case String'
 */
const snakeCaseToTitle = (str: string) =>
    str.replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

export { snakeCaseToTitle }