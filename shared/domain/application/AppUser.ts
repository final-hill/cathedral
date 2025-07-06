import { z } from 'zod'
import { ReqType } from '../requirements/ReqType.js'
import { AppRole } from './AppRole.js'

export const AppUser = z.object({
    id: z.string().uuid().readonly().describe('The unique identifier of the app user'),
    name: z.string().min(1).max(254).describe('The name of the app user'),
    email: z.string().min(1).max(254).email().describe('The email address of the app user'),
    isSystemAdmin: z.boolean().describe('Whether the app user is a system administrator'),
    creationDate: z.date().describe('The date the app user was created'),
    lastLoginDate: z.date().optional().describe('The date the app user last logged in'),
    lastModified: z.date().describe('The date and time when the app user was last modified'),
    role: z.nativeEnum(AppRole).optional().describe('The role of the app user in the current organization'),
    organizations: z.array(z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
        id: z.string().uuid()
            .describe('The id of the organization'),
        name: z.string()
            .describe('The name of the organization')
    })).default([]).describe('The organizations the app user is associated with'),
    credentials: z.array(z.object({
        id: z.string()
            .describe('The id of the credentials')
    })).optional().describe('The credentials of the app user')
}).describe('The users of the application')
