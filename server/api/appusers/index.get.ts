import { z } from 'zod'
import { PermissionInteractor, AppUserSlackInteractor, SlackUserInteractor } from '~~/server/application'
import { SlackRepository } from '~~/server/data/repositories'
import { Organization } from '#shared/domain'
import { SlackService } from '~~/server/data/services'

const { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        organizationId,
        organizationSlug,
        includeSlack: z.string().optional().transform(val => val === 'true').prefault('false').describe('Whether to include Slack associations for all users')
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns all appusers for the organization with their associated role
 */
export default defineEventHandler(async (event) => {
    const { organizationId, organizationSlug, includeSlack } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug })

    if (includeSlack) {
        const slackUserInteractor = new SlackUserInteractor({
                repository: new SlackRepository({ em: event.context.em }),
                permissionInteractor,
                slackService: new SlackService({ token: config.slackBotToken, slackSigningSecret: config.slackSigningSecret })
            }),
            appUserSlackInteractor = new AppUserSlackInteractor({
                organizationInteractor,
                slackUserInteractor
            })

        return await appUserSlackInteractor.getAppUsersWithSlack()
            .catch(handleDomainException)
    }

    return await organizationInteractor.getAppUsers().catch(handleDomainException)
})
