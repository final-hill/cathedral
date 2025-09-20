import { z } from 'zod'
import { AppRole } from './AppRole.js'
import { AppUserReference } from './EntityReferences.js'
import { OrganizationReference } from '../requirements/EntityReferences.js'

export const AppUserOrganizationRole = z.object({
    appUser: AppUserReference
        .describe('The user associated with the OrganizationRole'),
    organization: OrganizationReference
        .describe('The Organization associated with the OrganizationRole'),
    role: z.nativeEnum(AppRole).describe('The Role associated with the OrganizationRole')
}).describe('An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role managed by Microsoft Entra External ID')

export type AppUserOrganizationRoleType = z.infer<typeof AppUserOrganizationRole>
