import { z } from "zod"
import { EnvironmentComponent } from "~/domain/requirements/index.js"

/**
 * Creates a new environment-component and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: EnvironmentComponent,
    bodySchema: z.object({
        name: z.string().default("{Untitled Environment Component}"),
        description: z.string().default(""),
        parentComponentId: z.string().uuid().optional(),
        isSilence: z.boolean().default(false)
    })
})