import { z } from "zod";

export default z.object({
    type: z.literal('EnvironmentComponent'),
    name: z.string(),
    description: z.string()
    // TODO: The LLM won't be able to handle this without alot of help.
    // parentComponentId
}).describe('Represents a component that is part of an environment.')