import { z } from "zod"
import { Outcome } from "~/domain/requirements/index.js"

/**
 * Returns all obstacles that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Outcome,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})