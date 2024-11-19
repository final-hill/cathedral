import { z } from "zod"
import { GlossaryTerm } from "~/domain/requirements/index.js"

/**
 * Creates a new glossary term and returns its id
 */
export default postRequirementHttpHandler({
    ReqClass: GlossaryTerm,
    bodySchema: z.object({
        name: z.string().default("{Untitled Glossary Term}"),
        description: z.string().default(""),
        parentComponentId: z.string().uuid().optional(),
        isSilence: z.boolean().default(false)
    })
})