import { z } from "zod";

export default z.object({
    type: z.literal('Justification'),
    name: z.string(),
    statement: z.string()
}).describe('The reason/defense that supports or upholds the validity of a Project or System property in reference to a goal or Environment property.')