import { z } from 'zod';
import { AppRole } from './AppRole.js'

export const AppUser = z.object({
    id: z.string().uuid().readonly().describe('The unique identifier of the app user'),
    name: z.string().min(1).max(254).describe('The name of the app user'),
    email: z.string().min(1).max(254).email().describe('The email address of the app user'),
    role: z.nativeEnum(AppRole).describe('The role of the app user').optional(),
    isSystemAdmin: z.boolean().describe('Whether the app user is a system administrator'),
    creationDate: z.date().describe('The date the app user was created'),
    lastLoginDate: z.date().optional().describe('The date the app user last logged in'),
    lastModified: z.date().describe('The date and time when the app user was last modified'),
    isDeleted: z.boolean().describe('Whether the app user is deleted')
}).describe('The users of the application');