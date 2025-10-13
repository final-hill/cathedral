/**
 * Convert snake_case to camelCase
 * @example
 * snakeCaseToCamelCase('snake_case_string'); // 'snakeCaseString'
 * @param str - The snake_case string to convert
 * @returns The camelCase string
 */
export function snakeCaseToCamelCase(str: string): string {
    return str
        .replace(/^_+|_+$/g, '') // Remove leading and trailing underscores
        // eslint-disable-next-line max-params
        .replace(/_+(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}
