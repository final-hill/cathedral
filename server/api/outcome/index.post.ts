import { z } from "zod"
import { Outcome } from "~/domain/requirements/index.js"

/**
 * Creates a new obstacle and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Outcome,
    bodySchema: z.object({
        name: z.string().default("{Untitled Outcome}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})