/**
 * Transforms date strings to Date objects for requirement objects
 */

/**
 * Transforms date string properties to Date objects for a single requirement item
 * @param item - Object with creationDate and lastModified as strings
 * @returns Object with creationDate and lastModified as Date objects
 */
export function transformRequirementDates<T extends { creationDate: string, lastModified: string }>(
    item: T
): T & { creationDate: Date, lastModified: Date } {
    return {
        ...item,
        creationDate: new Date(item.creationDate),
        lastModified: new Date(item.lastModified)
    }
}
