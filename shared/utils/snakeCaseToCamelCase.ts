/**
 * Convert snake_case to camelCase
 * @example
 * snakeCaseToCamelCase('snake_case_string'); // 'snakeCaseString'
 * @param str - The snake_case string to convert
 * @returns The camelCase string
 */
const snakeCaseToCamelCase = (str: string) => str.replace(/_./g, char => char[1].toUpperCase());

export { snakeCaseToCamelCase }