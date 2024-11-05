import { z } from "zod";
import dedent from "#shared/dedent";

export default z.object({
    type: z.literal('UserStory'),
    name: z.string().describe('The name of the User Story'),
    role: z.string(),
    functionalBehavior: z.string(),
    outcome: z.string(),
    moscowPriority: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT'])
        .describe('The priority of the requirement, according to the MoSCoW method. Default is "MUST"'),
}).describe(dedent(`
    A User Story specifies the handling of a specific user need.
    As a [stakeholder], I want [functionalBehavior], so that [outcome].
`))