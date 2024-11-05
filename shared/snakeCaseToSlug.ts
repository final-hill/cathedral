/**
 * Convert snake_case to slug
 * @example
 * snakeCaseToSlug('snake_case_string'); // 'snake-case-string'
 */
export default (str: string) =>
    str.replace(/_/g, '-');