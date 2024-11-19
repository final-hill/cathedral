import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/domain/requirements/index.js"


/**
 * Updates a constraint by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Constraint,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.nativeEnum(ConstraintCategory).optional(),
        isSilence: z.boolean().optional()
    })
})