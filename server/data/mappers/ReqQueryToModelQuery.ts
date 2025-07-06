import type { Requirement } from '#shared/domain/requirements'
import type { z } from 'zod'
import type { Mapper } from './Mapper'

/**
 * Converts a Requirement query to a model query
 */
export class ReqQueryToModelQuery implements Mapper<Partial<z.infer<typeof Requirement>>, Record<string, unknown>> {
    async map(query: Partial<z.infer<typeof Requirement>>): Promise<Record<string, unknown>> {
        return Object.entries(query).reduce((acc, [key, value]: [string, unknown]) => {
            if (['createdBy', 'creationDate', 'id'].includes(key))
                return acc
            else if (value === undefined)
                return acc

            if (key === 'lastModified')
                key = 'effectiveFrom'
            else if (typeof value === 'object' && value !== null && 'id' in value)
                value = value.id
            return { ...acc, [key]: value }
        }, {})
    }
}
