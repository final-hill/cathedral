import type { RequirementType } from '#shared/domain/requirements'
import { ReqType } from '#shared/domain/requirements/ReqType'
import type { Mapper } from '#shared/types/Mapper'

/**
 * Converts a Requirement query to a model query
 */
export class ReqQueryToModelQuery implements Mapper<Partial<RequirementType>, Record<string, unknown>> {
    async map(query: Partial<RequirementType>): Promise<Record<string, unknown>> {
        // eslint-disable-next-line max-params
        return Object.entries(query).reduce((acc, [key, value]: [string, unknown]) => {
            // Skip audit fields and undefined values
            if (['createdBy', 'creationDate', 'id'].includes(key)) return acc
            else if (value === undefined) return acc
            // Skip category for Stakeholders only (it's derived), but allow it for Constraints
            else if (key === 'category' && query.reqType === ReqType.STAKEHOLDER) return acc

            if (key === 'lastModified') key = 'effectiveFrom'
            else if (key === 'appUser') key = 'appUserId'
            else if (typeof value === 'object' && value !== null && 'id' in value) value = value.id
            return { ...acc, [key]: value }
        }, {})
    }
}
