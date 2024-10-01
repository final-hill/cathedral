import { z } from "zod";

export default z.object({
    type: z.literal('EnvironmentComponent'),
    name: z.string(),
    statement: z.string()
    // TODO: The LLM won't be able to handle this without alot of help.
    // parentComponent
}).describe('Represents a component that is part of an environment.')