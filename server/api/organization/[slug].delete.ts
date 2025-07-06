import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository, PermissionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = await requireUserSession(event),
        organizationInteractor = new OrganizationCollectionInteractor({
            permissionInteractor: new PermissionInteractor({
                userId: session.user.id,
                repository: new PermissionRepository({ em: event.context.em })
            }),
            repository: new OrganizationCollectionRepository({ em: event.context.em })
        })

    return await organizationInteractor.deleteOrganizationBySlug(slug).catch(handleDomainException)
})
