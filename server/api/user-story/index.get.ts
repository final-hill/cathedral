import { z } from "zod"
import { UserStory, MoscowPriority } from "~/domain/requirements/index.js"

/**
 * Returns all user stories that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: UserStory,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        primaryActorId: z.string().uuid().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        outcomeId: z.string().uuid().optional(),
        functionalBehaviorId: z.string().uuid().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})