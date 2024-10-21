import { z } from "zod";

export default z.object({
    type: z.literal('Constraint'),
    name: z.string(),
    description: z.string(),
    category: z.enum(['Business Rule', 'Physical Law', 'Engineering Decision'])
}).describe('A Constraint is a property imposed by the environment')