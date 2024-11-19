import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/domain/requirements/index.js"

/**
 * Returns all constraints that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: Constraint,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.nativeEnum(ConstraintCategory).optional(),
        isSilence: z.boolean().optional().default(false)
    })
})