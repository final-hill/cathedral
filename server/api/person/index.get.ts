import { z } from "zod"
import { Person } from "~/domain/requirements/index.js"

/**
 * Returns all persons that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Person,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})