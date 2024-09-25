/*
 * Convert a camelCase string to a Title Case string.
 * @example
 * camelCaseToTitle('camelCaseString'); // 'Camel Case String'
 */
export default (str: string) =>
    str.replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase());
