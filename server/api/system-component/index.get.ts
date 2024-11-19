import { z } from "zod"
import { SystemComponent } from "~/domain/requirements/index.js"

/**
 * Returns all system-components that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: SystemComponent,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        parentComponent: z.string().uuid().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})