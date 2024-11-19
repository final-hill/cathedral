import { z } from "zod"
import { Effect } from "~/domain/requirements/index.js"

/**
 * Creates a new effect and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Effect,
    bodySchema: z.object({
        name: z.string().default("{Untitled Effect}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})