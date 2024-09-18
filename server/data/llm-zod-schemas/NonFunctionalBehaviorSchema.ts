import { z } from "zod";

export default z.object({
    type: z.literal('NonFunctionalBehavior'),
    name: z.string(),
    statement: z.string(),
    moscowPriority: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']),
}).describe(dedent(`
    NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
    It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
    Generally expressed in the form "system shall be <requirement>."
`))
