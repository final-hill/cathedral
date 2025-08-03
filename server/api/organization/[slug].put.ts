import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const paramSchema = Organization.innerType().pick({ slug: true }),
    bodySchema = Organization.innerType().pick({ name: true, description: true }).partial()

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        entraGroupService = createEntraGroupService(),
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: entraGroupService
        }),
        organizationInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraGroupService
        })

    return await organizationInteractor.updateOrganizationBySlug(slug, body).catch(handleDomainException)
})
