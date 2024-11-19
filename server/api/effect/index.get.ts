import { z } from "zod"
import { Effect } from "~/domain/requirements/index.js"

/**
 * Returns all effects that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Effect,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})