/**
 * Convert snake_case to PascalCase
 * @example
 * snakeCaseToPascalCase('snake_case_string'); // 'SnakeCaseString'
 * @param str - The snake_case string to convert
 * @returns The PascalCase string
 */
export function snakeCaseToPascalCase(str: string): string {
    return str
        .replace(/^_+|_+$/g, '') // Remove leading and trailing underscores
        .replace(/_+(\w)/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^\w/, c => c.toUpperCase())
}