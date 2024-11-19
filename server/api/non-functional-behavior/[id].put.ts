import { z } from "zod"
import { NonFunctionalBehavior, MoscowPriority } from "~/domain/requirements/index.js"

/**
 * Updates a non functional behavior by id.
 */
export default putRequirementHttpHandler({
    ReqClass: NonFunctionalBehavior,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        isSilence: z.boolean().optional()
    })
})