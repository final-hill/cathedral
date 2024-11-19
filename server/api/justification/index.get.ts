import { z } from "zod"
import { Justification } from "~/domain/requirements/index.js"

/**
 * Returns all justifications that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Justification,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})