import { z } from "zod"
import { Outcome } from "~/domain/requirements/index.js"

/**
 * Updates an outcome by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Outcome,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})