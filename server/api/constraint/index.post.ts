import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/domain/requirements/index.js"

/**
 * Creates a new constraint and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Constraint,
    bodySchema: z.object({
        name: z.string().default("{Untitled Constraint}"),
        description: z.string().default(""),
        category: z.nativeEnum(ConstraintCategory).optional(),
        isSilence: z.boolean().default(false)
    })
})