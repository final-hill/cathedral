import { z } from "zod"
import { Invariant } from "~/domain/requirements/index.js"

/**
 * Creates a new invariant and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Invariant,
    bodySchema: z.object({
        name: z.string().default("{Untitled Invariant}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})