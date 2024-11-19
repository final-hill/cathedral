import { z } from "zod"
import { SystemComponent } from "~/domain/requirements/index.js"

/**
 * Creates a new system-component and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: SystemComponent,
    bodySchema: z.object({
        name: z.string().default("{Untitled System Component}"),
        description: z.string().default(""),
        parentComponent: z.string().uuid().optional(),
        isSilence: z.boolean().default(false)
    })
})