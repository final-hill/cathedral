import { z } from "zod";

export default z.object({
    type: z.literal('Obstacle'),
    name: z.string(),
    description: z.string()
}).describe('Obstacles are the challenges that prevent goals from being achieved')