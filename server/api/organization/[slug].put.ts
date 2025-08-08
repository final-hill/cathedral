import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraService } from '~/server/utils/createEntraService'

const paramSchema = Organization.innerType().pick({ slug: true }),
    bodySchema = Organization.innerType().pick({ name: true, description: true }).partial()

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraService
        })

    return await organizationInteractor.updateOrganizationBySlug(slug, body).catch(handleDomainException)
})
