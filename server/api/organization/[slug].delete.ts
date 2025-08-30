import { OrganizationCollectionInteractor, PermissionInteractor } from '~~/server/application'
import { OrganizationCollectionRepository } from '~~/server/data/repositories'
import { Organization } from '#shared/domain'

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationCollectionInteractor({
            permissionInteractor,
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            entraService
        })

    return await organizationInteractor.deleteOrganizationBySlug(slug).catch(handleDomainException)
})
