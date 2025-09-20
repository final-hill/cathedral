import z from 'zod'

export const AppUserReference = z.object({
    id: z.string().uuid()
        .describe('The unique identifier of the user'),
    name: z.string()
        .describe('The name of the user')
}).readonly()
