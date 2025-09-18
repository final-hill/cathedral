import type { RequirementType } from '#shared/domain/requirements'
import type { Mapper } from '#shared/types/Mapper'

/**
 * Converts a Requirement query to a model query
 */
export class ReqQueryToModelQuery implements Mapper<Partial<RequirementType>, Record<string, unknown>> {
    async map(query: Partial<RequirementType>): Promise<Record<string, unknown>> {
        return Object.entries(query).reduce((acc, [key, value]: [string, unknown]) => {
            if (['createdBy', 'creationDate', 'id'].includes(key)) return acc
            else if (value === undefined) return acc

            if (key === 'lastModified') key = 'effectiveFrom'
            else if (typeof value === 'object' && value !== null && 'id' in value) value = value.id
            return { ...acc, [key]: value }
        }, {})
    }
}
