import { z } from "zod"
import { Assumption } from "~/domain/requirements/index.js"

/**
 * Creates a new assumption and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Assumption,
    bodySchema: z.object({
        name: z.string().default("{Untitled Assumption}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})