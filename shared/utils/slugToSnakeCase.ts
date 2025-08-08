/**
 * Convert slug (kebab-case) to snake_case
 * @param str - The slug string to convert
 * @returns The snake_case string
 * @example
 * slugToSnakeCase('kebab-case-string'); // 'kebab_case_string'
 * slugToSnakeCase('glossary-term'); // 'glossary_term'
 */
const slugToSnakeCase = (str: string): string =>
    str.replace(/-/g, '_')

export { slugToSnakeCase }
