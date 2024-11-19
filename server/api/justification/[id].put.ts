import { z } from "zod"
import { Justification } from "~/domain/requirements/index.js"

/**
 * Updates a Justification by id.
 */
export default putRequirementHttpHandler({
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    }),
    ReqClass: Justification
})