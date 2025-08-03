import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, AppUserSlackInteractor, SlackUserInteractor } from '~/application'
import { OrganizationRepository, SlackRepository } from '~/server/data/repositories'
import { SlackService } from '~/server/data/services'
import handleDomainException from '~/server/utils/handleDomainException'
import { AppUser, Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const paramSchema = AppUser.pick({ id: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const querySchema = z.object({
    organizationId,
    organizationSlug,
    includeSlack: z.string().optional().transform(val => val === 'true').default('false').describe('Whether to include Slack associations')
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, includeSlack } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        permissionInteractor = new PermissionInteractor({
            event,
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
        }),
        orgId = (await organizationInteractor.getOrganization()).id,
        auor = await permissionInteractor.getAppUserOrganizationRole({ appUserId: id, organizationId: orgId })
            .catch(handleDomainException)

    if (includeSlack) {
        const slackUserInteractor = new SlackUserInteractor({
            repository: new SlackRepository({ em: event.context.em }),
            permissionInteractor,
            slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
        })

        const appUserSlackInteractor = new AppUserSlackInteractor({
            organizationInteractor,
            slackUserInteractor
        })

        return await appUserSlackInteractor.getAppUserByIdWithSlack(auor!.appUser.id)
            .catch(handleDomainException)
    }

    return await organizationInteractor.getAppUserById(auor!.appUser.id).catch(handleDomainException)
})
