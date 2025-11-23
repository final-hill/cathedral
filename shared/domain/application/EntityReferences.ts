import z from 'zod'

export type AppUserReferenceType = z.infer<typeof AppUserReference>
export const AppUserReference = z.object({
    id: z.string()
        .describe('The unique identifier of the user (Entra user ID)'),
    name: z.string()
        .describe('The name of the user'),
    entityType: z.literal('app_user').prefault('app_user')
        .describe('Type identifier for autocomplete system')
})
