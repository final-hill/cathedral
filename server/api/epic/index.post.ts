import { z } from "zod"
import { Epic, MoscowPriority } from "~/domain/requirements/index.js"

/**
 * Creates a new epic and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Epic,
    bodySchema: z.object({
        name: z.string().default("{Untitled Epic}"),
        priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
        primaryActor: z.string().uuid(),
        outcome: z.string().uuid(),
        description: z.string().default(""),
        functionalBehavior: z.string().uuid().optional(),
        isSilence: z.boolean().default(false)
    })
})