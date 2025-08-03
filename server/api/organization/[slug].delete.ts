import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = await requireUserSession(event),
        entraGroupService = createEntraGroupService(),
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: entraGroupService
        }),
        organizationInteractor = new OrganizationCollectionInteractor({
            permissionInteractor,
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            entraGroupService
        })

    return await organizationInteractor.deleteOrganizationBySlug(slug).catch(handleDomainException)
})
