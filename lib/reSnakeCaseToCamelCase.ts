const reSnakeCaseToCamelCase = (str: string) => str.replace(/_./g, match => match[1].toUpperCase());
