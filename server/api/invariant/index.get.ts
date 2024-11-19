import { z } from "zod"
import { Invariant } from "~/domain/requirements/index.js"

/**
 * Returns all invariants that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Invariant,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})