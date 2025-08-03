import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const querySchema = Organization.innerType().partial()

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        entraGroupService = createEntraGroupService(),
        permissionInteractor = new PermissionInteractor({
            session,
            event,
            groupService: entraGroupService
        }),
        organizationCollectionInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraGroupService
        })

    return organizationCollectionInteractor.findOrganizations(query).catch(handleDomainException)
})
