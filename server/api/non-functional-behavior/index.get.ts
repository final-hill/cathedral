import { z } from "zod"
import { MoscowPriority, NonFunctionalBehavior } from "~/domain/requirements/index.js"

/**
 * Returns all non functional behaviors that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: NonFunctionalBehavior,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.nativeEnum(MoscowPriority).optional(),
        isSilence: z.boolean().optional().default(false)
    })
})