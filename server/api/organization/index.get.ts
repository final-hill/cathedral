import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraService } from '~/server/utils/createEntraService'

const querySchema = Organization.innerType().partial()

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ session, event, entraService }),
        organizationCollectionInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraService
        })

    return organizationCollectionInteractor.findOrganizations(query).catch(handleDomainException)
})
