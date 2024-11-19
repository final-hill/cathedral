import { z } from "zod"
import { Epic } from "~/domain/requirements/index.js"

/**
 * Returns all epics that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Epic,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})