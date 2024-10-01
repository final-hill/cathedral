import { z } from "zod";

export default z.object({
    type: z.literal('GlossaryTerm'),
    name: z.string(),
    description: z.string()
}).describe('A word or phrase that is part of a glossary. Provides a definition for the term')