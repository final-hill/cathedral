import { OrganizationCollectionInteractor, PermissionInteractor } from '~~/server/application'
import { OrganizationCollectionRepository } from '~~/server/data/repositories'
import { Organization } from '#shared/domain'

const querySchema = Organization.partial()

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery({ event, schema: querySchema }),
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
