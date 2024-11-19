import { z } from "zod"
import { FunctionalBehavior, MoscowPriority } from "~/domain/requirements/index.js"

/**
 * Returns all functional behaviors that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: FunctionalBehavior,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        isSilence: z.boolean().optional().default(false)
    })
})