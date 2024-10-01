import { z } from "zod";

export default z.object({
    type: z.literal('Invariant'),
    name: z.string(),
    statement: z.string()
}).describe('Environment property that must be maintained. It exists as both an assumption and an effect. (precondition and postcondition)')