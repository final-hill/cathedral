import { z } from "zod";

export default z.object({
    type: z.literal('SystemComponent'),
    name: z.string(),
    statement: z.string()
    // TODO: The LLM won't be able to handle this without alot of help.
    // parentComponent
}).describe('A system component is a part of the System')