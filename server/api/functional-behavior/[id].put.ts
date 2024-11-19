import { z } from "zod"
import { FunctionalBehavior, MoscowPriority } from "~/domain/requirements/index.js"

/**
 * Updates a functional behavior by id.
 */
export default putRequirementHttpHandler({
    ReqClass: FunctionalBehavior,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        isSilence: z.boolean().optional()
    })
})