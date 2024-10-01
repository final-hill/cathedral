import { z } from "zod";

export default z.object({
    type: z.literal('Person'),
    name: z.string(),
    statement: z.string(),
    email: z.string()
        .describe('Email address of the person, if available, otherwise first.last@example.com'),
}).describe('A person is a member of the Project staff. This is not a role, but a specific individual')