import { Requirement } from "~/domain/requirements"
import { type Mapper } from "./Mapper"

/**
 * Converts a Requirement query to a model query
 */
export class ReqQueryToModelQuery implements Mapper<Partial<Requirement>, Record<string, any>> {
    map(query: Partial<Requirement>) {
        return Object.entries(query).reduce((acc, [key, value]) => {
            if (['createdById', 'creationDate', 'id'].includes(key))
                return acc
            if (key.endsWith('Id'))
                key = key.slice(0, -2)
            else if (key === 'lastModified')
                key = 'effectiveFrom'
            return { ...acc, [key]: value }
        }, {})
    }
}