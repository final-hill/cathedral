import { OrganizationCollectionInteractor, PermissionInteractor } from '~~/server/application'
import { OrganizationCollectionRepository } from '~~/server/data/repositories'
import { Organization } from '#shared/domain'

const paramSchema = Organization.pick({ slug: true }),
    bodySchema = Organization.pick({ name: true, description: true }).partial()

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams({ event, schema: paramSchema }),
        body = await validateEventBody({ event, schema: bodySchema }),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraService
        })

    return await organizationInteractor.updateOrganizationBySlug({ slug, ...body }).catch(handleDomainException)
})
