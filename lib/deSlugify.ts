/**
 * deslugify the provided string by replacing hyphens with spaces and converting to Title Case
 */
export default (str: string) => {
    return str.replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}