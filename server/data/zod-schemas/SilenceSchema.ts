import { z } from "zod";

export default z.object({
    type: z.literal('Silence'),
    statement: z.string()
}).describe('A requirement that can not be expressed in the current schema')