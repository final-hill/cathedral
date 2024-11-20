const deSlugify = (str: string) => str.replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

export { deSlugify }