import { z } from "zod"
import { SystemComponent } from "~/domain/requirements/index.js"

/**
 * Updates an environment component by id.
 */
export default putRequirementHttpHandler({
    ReqClass: SystemComponent,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        parentComponent: z.string().uuid().optional(),
        isSilence: z.boolean().optional()
    })
})