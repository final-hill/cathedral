import { z } from 'zod'
import { PermissionInteractor, AppUserSlackInteractor, SlackUserInteractor } from '~~/server/application'
import { SlackRepository } from '~~/server/data/repositories'
import { SlackService } from '~~/server/data/services'
import { AppUser, Organization } from '#shared/domain'

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        organizationId,
        organizationSlug,
        includeSlack: z.string().optional().transform(val => val === 'true').prefault('false').describe('Whether to include Slack associations')
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams({ event, schema: paramSchema }),
        { organizationId, organizationSlug, includeSlack } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug }),
        orgId = (await organizationInteractor.getOrganization()).id,
        auor = await permissionInteractor.getAppUserOrganizationRole({ appUserId: id, organizationId: orgId })
            .catch(handleDomainException)

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

        return await appUserSlackInteractor.getAppUserByIdWithSlack(auor!.appUser.id)
            .catch(handleDomainException)
    }

    return await organizationInteractor.getAppUserById(auor!.appUser.id).catch(handleDomainException)
})
