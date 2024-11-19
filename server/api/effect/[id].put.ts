import { z } from "zod"
import { Effect } from "~/domain/requirements/index.js"

/**
 * Updates an effect by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Effect,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})