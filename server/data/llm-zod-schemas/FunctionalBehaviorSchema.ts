import { z } from "zod";

export default z.object({
    type: z.literal('FunctionalBehavior'),
    name: z.string(),
    statement: z.string(),
    moscowPriority: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']),
}).describe(dedent(`
    FunctionalBehavior specifies **what** behavior the system should exhibit,
    i.e., the results or effects of the system\'s operation. Generally expressed
    in the form "system must do <requirement>"
`))