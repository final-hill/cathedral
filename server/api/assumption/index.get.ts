import { z } from "zod"
import { Assumption } from "~/domain/requirements/index.js"

/**
 * Returns all assumptions that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Assumption,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})