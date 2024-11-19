import { z } from "zod"
import { Limit } from "~/domain/requirements/index.js"

/**
 * Returns all limits that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Limit,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})