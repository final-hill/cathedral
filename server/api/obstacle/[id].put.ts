import { z } from "zod"
import { Obstacle } from "~/domain/requirements/index.js"

/**
 * Updates an obstacle by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Obstacle,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})