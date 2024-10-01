import { z } from "zod";

export default z.object({
    type: z.literal('Limit'),
    name: z.string(),
    statement: z.string()
}).describe('An Exclusion from the scope of requirements')
