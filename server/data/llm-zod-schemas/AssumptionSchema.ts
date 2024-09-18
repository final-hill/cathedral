import { z } from "zod";

export default z.object({
    type: z.literal('Assumption'),
    name: z.string(),
    statement: z.string()
}).describe('A Posited property of the environment')