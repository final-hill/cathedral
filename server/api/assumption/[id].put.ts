import { z } from "zod"
import { Assumption } from '~/domain/requirements'

/**
 * Updates an assumption by id.
 */
export default putRequirementHttpHandler({
    ReqClass: Assumption,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})