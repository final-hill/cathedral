import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, AppUserSlackInteractor, Slack } from '~/application'
import { OrganizationRepository, SlackRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'
import { SlackService } from '~/server/data/services'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const querySchema = z.object({
    organizationId,
    organizationSlug,
    includeSlack: z.string().optional().transform(val => val === 'true').default('false').describe('Whether to include Slack associations for all users')
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns all appusers for the organization with their associated role
 */
export default defineEventHandler(async (event) => {
    const { organizationId, organizationSlug, includeSlack } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        permissionInteractor = new PermissionInteractor({
            session,
            groupService: createEntraGroupService()
        }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                groupService: createEntraGroupService()
            }),
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId,
                organizationSlug
            })
        })

    if (includeSlack) {
        const slackUserInteractor = new Slack.SlackUserInteractor({
            repository: new SlackRepository({ em: event.context.em }),
            permissionInteractor: new PermissionInteractor({
                session: {
                    id: config.systemSlackUserId as string,
                    user: {
                        id: config.systemSlackUserId as string,
                        name: config.systemSlackUserName as string,
                        email: config.systemSlackUserEmail as string,
                        groups: []
                    },
                    loggedInAt: Date.now()
                },
                groupService: createEntraGroupService()
            }),
            slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
        })

        const appUserSlackInteractor = new AppUserSlackInteractor({
            organizationInteractor,
            slackUserInteractor
        })

        return await appUserSlackInteractor.getAppUsersWithSlack()
            .catch(handleDomainException)
    }

    return await organizationInteractor.getAppUsers().catch(handleDomainException)
})
