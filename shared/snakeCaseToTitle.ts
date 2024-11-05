/**
 * Convert snake_case to Title Case
 * @example
 * snakeCaseToTitle('snake_case_string'); // 'Snake Case String'
 */
export default (str: string) =>
    str.replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());