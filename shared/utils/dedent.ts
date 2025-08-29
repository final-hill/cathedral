/**
 * Dedent a string
 */
const dedent = (str: string) => {
    const match = str.match(/^[ \t]*(?=\S)/gm)

    if (!match) return str

    // Find the smallest indentation
    const indent = Math.min(...match.map(x => x.length)),
        re = new RegExp(`^[ \\t]{${indent}}`, 'gm')

    return indent > 0 ? str.replace(re, '') : str
}

export { dedent }
