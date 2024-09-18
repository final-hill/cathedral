import { z } from "zod";

export default z.object({
    type: z.literal('Obstacle'),
    name: z.string(),
    statement: z.string()
}).describe('Obstacles are the challenges that prevent goals from being achieved')