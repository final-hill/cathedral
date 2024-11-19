import { z } from "zod"
import { Obstacle } from "~/domain/requirements/index.js"

/**
 * Creates a new obstacle and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: Obstacle,
    bodySchema: z.object({
        name: z.string().default("{Untitled Obstacle}"),
        description: z.string().default(""),
        isSilence: z.boolean().default(false)
    })
})