/**
 * Transforms date strings to Date objects for requirement objects
 */

import type { AuditMetadataType } from '../domain'

/**
 * Transforms date string properties to Date objects for a single requirement item
 * @param item - Object with creationDate and lastModified as strings
 * @returns Object with creationDate and lastModified as Date objects
 */
export function transformRequirementDates<T extends AuditMetadataType>(
    item: T
): T {
    return {
        ...item,
        creationDate: new Date(item.creationDate),
        lastModified: new Date(item.lastModified)
    }
}
