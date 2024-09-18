import { z } from "zod";

export default z.object({
    type: z.literal('UserStory'),
    role: z.string(),
    functionalBehavior: z.string(),
    outcome: z.string()
}).describe(dedent(`
    A User Story specifies the handling of a specific user need.
    As a [stakeholder], I want [functionalBehavior], so that [outcome].
`))