import { z } from "zod"
import { MoscowPriority, UserStory } from "~/domain/requirements/index.js"

/**
 * Creates a new user story and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: UserStory,
    bodySchema: z.object({
        name: z.string().default("{Untitled User Story}"),
        description: z.string().default(""),
        primaryActor: z.string().uuid().optional(),
        priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
        outcome: z.string().uuid().optional(),
        functionalBehavior: z.string().uuid().optional(),
        isSilence: z.boolean().default(false)
    })
})