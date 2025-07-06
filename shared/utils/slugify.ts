/**
 * Slugify a string by converting it to lowercase, removing whitespace,
 * and replacing non-word characters with hyphens.
 */
const slugify = (str: string) =>
    str.toLowerCase().trim()
        .replace(/\s/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')

export { slugify }
