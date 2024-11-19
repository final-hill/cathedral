import { z } from "zod"
import { Invariant } from "~/domain/requirements/index.js"

/**
 * Updates an invariant by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Invariant,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})