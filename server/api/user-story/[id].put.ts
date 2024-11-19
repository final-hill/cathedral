import { z } from "zod"
import { MoscowPriority, UserStory } from "~/domain/requirements/index.js"

/**
 * Updates a User Story by id
 */
export default putRequirementHttpHandler({
    ReqClass: UserStory,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        primaryActor: z.string().uuid().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        outcome: z.string().uuid().optional(),
        functionalBehavior: z.string().uuid().optional(),
        isSilence: z.boolean().optional()
    })
})