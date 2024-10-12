/**
 * Convert camelCase string to slug
 * @example
 * camelCaseToSlug('camelCase') // 'camel-case'
 */
export default (str: string) =>
    str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();