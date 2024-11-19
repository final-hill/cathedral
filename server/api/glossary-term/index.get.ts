import { z } from "zod"
import { GlossaryTerm } from "~/domain/requirements/index.js"

/**
 * Returns all glossary terms that match the query parameters
 */
export default findRequirementsHttpHandler({
    ReqClass: GlossaryTerm,
    querySchema: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isSilence: z.boolean().optional().default(false)
    })
})