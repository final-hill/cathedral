import { z } from 'zod'
import { AppUser, AppRole } from '#shared/domain/application'
import { ReqType } from '#shared/domain/requirements/enums'

/**
 * Schema for Slack user associations
 */
const SlackAssociation = z.object({
    slackUserId: z.string().describe('The Slack user ID'),
    teamId: z.string().describe('The Slack team/workspace ID'),
    teamName: z.string().describe('The name of the Slack workspace'),
    creationDate: z.date().describe('When the association was created')
})

/**
 * DTO for AppUser with organization role information
 * Used for transferring user data with role context between application layers
 */
export const AppUserWithRoleDto = AppUser.extend({
    role: z.nativeEnum(AppRole).describe('The role of the user in the organization'),
    organizations: z.array(z.object({
        reqType: z.nativeEnum(ReqType).default(ReqType.ORGANIZATION),
        id: z.string().uuid().describe('The id of the Organization'),
        name: z.string().describe('The name of the Organization')
    })).describe('The organizations the user belongs to')
}).describe('An AppUser with their role and organization information')

/**
 * DTO for AppUser with role and Slack associations
 * Used when including Slack data in user responses
 */
export const AppUserWithRoleAndSlackDto = AppUserWithRoleDto.extend({
    slackAssociations: z.array(SlackAssociation).optional().describe('Slack user associations for this Cathedral user')
}).describe('An AppUser with their role, organization information, and Slack associations')

export type AppUserWithRoleDtoType = z.infer<typeof AppUserWithRoleDto>
export type AppUserWithRoleAndSlackDtoType = z.infer<typeof AppUserWithRoleAndSlackDto>
