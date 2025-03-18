import { Requirement } from "#shared/domain/requirements"
import { type Mapper } from "./Mapper"

/**
 * Converts a Requirement query to a model query
 */
export class ReqQueryToModelQuery implements Mapper<Partial<Zod.infer<typeof Requirement>>, Record<string, any>> {
    async map(query: Partial<Zod.infer<typeof Requirement>>): Promise<Record<string, any>> {
        return Object.entries(query).reduce((acc, [key, value]: [string, any]) => {
            if (['createdBy', 'creationDate', 'id'].includes(key))
                return acc
            else if (value === undefined)
                return acc

            if (key === 'lastModified')
                key = 'effectiveFrom'
            else if (typeof value === 'object' && 'id' in value)
                value = value.id
            return { ...acc, [key]: value }
        }, {})
    }
}