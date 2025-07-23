import { z } from 'zod'
import { AppRole } from './AppRole.js'

export const AppUser = z.object({
    id: z.string().min(1).max(766).readonly().describe('The user identifier'),
    name: z.string().min(1).max(254).describe('The name of the app user'),
    email: z.string().min(1).max(254).email().describe('The email address of the app user'),
    role: z.nativeEnum(AppRole).optional().describe('The role of the app user in the current organization')
}).describe('The users of the application')
