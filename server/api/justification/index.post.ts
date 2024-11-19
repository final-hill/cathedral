import { z } from "zod"
import { Justification } from "~/domain/requirements/index.js"

/**
 * Creates a new justifications and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Justification,
    bodySchema: z.object({
        name: z.string().default("{Untitled Justification}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})