import { z } from "zod"
import { EnvironmentComponent } from "~/domain/requirements/index.js"

/**
 * Returns all environment-components that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: EnvironmentComponent,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        parentComponentId: z.string().uuid().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})