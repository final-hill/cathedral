import { z } from "zod"
import { MoscowPriority, NonFunctionalBehavior } from "~/domain/requirements/index.js"

/**
 * Creates a new non functional behavior and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: NonFunctionalBehavior,
    bodySchema: z.object({
        name: z.string().default("{Untitled Non-Functional Behavior}"),
        description: z.string().default(""),
        priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
        isSilence: z.boolean().default(false)
    })
})