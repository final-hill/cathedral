import { z } from "zod"
import { MoscowPriority, FunctionalBehavior } from "~/domain/requirements/index.js"

/**
 * Creates a new functional behavior and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: FunctionalBehavior,
    bodySchema: z.object({
        name: z.string().default("{Untitled Functional Behavior}"),
        description: z.string().default(""),
        priority: z.nativeEnum(MoscowPriority),
        isSilence: z.boolean().default(false)
    })
})