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
    role: z.nativeEnum(AppRole).describe('The Role associated with the OrganizationRole')
}).describe('An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role managed by Microsoft Entra External ID')
