export default (str: string) =>
    str.toLowerCase().trim()
        .replace(/\s/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');