import { z } from "zod"
import { Person } from "~/domain/requirements/index.js"

/**
 * Updates a person by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Person,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        isSilence: z.boolean().optional()
    })
})