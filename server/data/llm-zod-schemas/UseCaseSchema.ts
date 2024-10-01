import { z } from "zod";

export default z.object({
    type: z.literal('UseCase'),
    name: z.string().describe('The name of the Use Case'),
    primaryActor: z.string().describe('The primary actor involved in the Use Case. Use N/A if there is no primary actor.'),
    scope: z.string().describe('The scope of the Use Case. Use N/A if there is no scope.'),
    level: z.string().describe('The level of the Use Case. Use N/A if there is no level.'),
    goalInContext: z.string().describe('The goal in context of the Use Case. Use N/A if there is no goal in context.'),
    precondition: z.string().describe('The precondition is an Assumption that must be true before the Use Case can start. Use N/A if there is no precondition.'),
    mainSuccessScenario: z.string().describe('The main success scenario is the most common path through the system. It takes the form of a sequence of steps that describe the interaction. Use N/A if there is no main success scenario.'),
    successGuarantee: z.string().describe('The success guarantee is the guarantee that the system will provide to the user. Use N/A if there is no success guarantee.'),
    extensions: z.string().describe('The extensions are the possible paths that the user can take. Use N/A if there are no extensions.'),
    moscowPriority: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']),
}).describe(dedent(`
    A Use Case specifies the scenario of a complete
    interaction of a user through a system.
`))