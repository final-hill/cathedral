import { z } from "zod"
import { Person } from "~/domain/requirements/index.js"

/**
 * Creates a new person and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Person,
    bodySchema: z.object({
        name: z.string().default("{Anonymous Person}"),
        description: z.string().default(""),
        email: z.string().email().optional(),
        isSilence: z.boolean().default(false)
    })
})