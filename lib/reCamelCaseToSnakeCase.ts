const reCamelCaseToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

export default reCamelCaseToSnakeCase;