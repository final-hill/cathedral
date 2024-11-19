import { z } from "zod"
import { Limit } from "~/domain/requirements/index.js"

/**
 * Creates a new limit and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Limit,
    bodySchema: z.object({
        name: z.string().default("{Untitled Limit}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})