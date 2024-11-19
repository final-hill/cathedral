import { z } from "zod"
import { EnvironmentComponent } from "~/domain/requirements/index.js"

/**
 * Updates an environment component by id.
 */
export default putRequirementHttpHandler({
    ReqClass: EnvironmentComponent,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        parentComponentId: z.string().uuid().optional(),
        isSilence: z.boolean().optional()
    })
})