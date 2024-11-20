/**
 * Convert snake_case to slug
 * @example
 * snakeCaseToSlug('snake_case_string'); // 'snake-case-string'
 */
const snakeCaseToSlug = (str: string) =>
    str.replace(/_/g, '-');

export { snakeCaseToSlug }