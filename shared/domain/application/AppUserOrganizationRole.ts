import { z } from 'zod'
import { AppRole } from './AppRole.js'
import { ReqType } from '../requirements/ReqType.js'

export const AppUserOrganizationRole = z.object({
    appUser: z.object({
        id: z.string().uuid()
            .describe('The id of the AppUser associated with the OrganizationRole'),
        name: z.string()
            .describe('The name of the AppUser associated with the OrganizationRole')
    }).describe('The user associated with the OrganizationRole'),
    organization: z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
        id: z.string().uuid()
            .describe('The id of the Organization associated with the OrganizationRole'),
        name: z.string()
            .describe('The name of the Organization associated with the OrganizationRole')
    }).describe('The Organization associated with the OrganizationRole'),
    role: z.nativeEnum(AppRole).describe('The Role associated with the OrganizationRole'),
    createdBy: z.object({
        id: z.string().uuid()
            .describe('The user who created the entity'),
        name: z.string()
            .describe('The name of the user who created the entity')
    }).readonly().describe('The user who created the entity'),
    creationDate: z.date().readonly()
        .describe('The date and time when the entity was created'),
    lastModified: z.date()
        .describe('The date and time when the entity was last modified'),
    modifiedBy: z.object({
        id: z.string().uuid()
            .describe('The user who last modified the entity'),
        name: z.string()
            .describe('The name of the user who last modified the entity')
    })
}).describe('An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role')
