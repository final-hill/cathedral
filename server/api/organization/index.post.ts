import { OrganizationCollectionInteractor, PermissionInteractor } from '~~/server/application/index'
import { OrganizationCollectionRepository } from '~~/server/data/repositories'
import { Organization } from '#shared/domain'

const bodySchema = Organization.pick({ name: true, description: true })

/**
 * Creates a new organization and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { name, description } = await validateEventBody({ event, schema: bodySchema }),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationCollectionInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraService
        })

        return organizationCollectionInteractor.createOrganization({ name, description })
            .then(() => slugify(name))
            .catch(handleDomainException)
})
