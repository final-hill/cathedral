import { z } from "zod";

export default z.object({
    type: z.literal('Outcome'),
    name: z.string(),
    description: z.string()
}).describe('A result desired by an Organization')