import { z } from "zod";

export default z.object({
    type: z.literal('Effect'),
    name: z.string(),
    statement: z.string()
}).describe('Environment property affected by the system')