import { z } from "zod"
import { GlossaryTerm } from "~/domain/requirements/index.js"

/**
 * Updates a glossary term by id.
 */
export default putRequirementHttpHandler({
    ReqClass: GlossaryTerm,
    bodySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional()
    })
})