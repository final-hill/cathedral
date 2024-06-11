/**
 * Slugify a string by converting it to lowercase, removing whitespace, 
 * and replacing non-word characters with hyphens.
 */
export default (str: string) =>
    str.toLowerCase().trim()
        .replace(/\s/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');