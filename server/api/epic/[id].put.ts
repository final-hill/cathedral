import { z } from "zod"
import { Epic, MoscowPriority } from "~/domain/requirements/index.js"

/**
 * Updates an epic by id.
*/
export default putRequirementHttpHandler({
    ReqClass: Epic,
    bodySchema: z.object({
        name: z.string().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        primaryActor: z.string().uuid().optional(),
        outcome: z.string().uuid().optional(),
        description: z.string().optional(),
        functionalBehavior: z.string().uuid().optional(),
        isSilence: z.boolean().optional()
    })
})