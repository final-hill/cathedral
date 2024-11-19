import { z } from "zod"
import { Limit } from "~/domain/requirements/index.js"

/**
 * Updates a limit by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Limit,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})