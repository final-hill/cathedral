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

    try {
        const newOrgId = await organizationCollectionInteractor.createOrganization({ name, description }),
            organizations = await organizationCollectionInteractor.findOrganizations({ id: newOrgId! }),
            newOrg = organizations[0]

        if (!newOrg) {
            console.error(`Failed to find newly created organization for id: ${newOrgId}`)
            throw createError({
                status: 500,
                message: `Failed to find newly created organization for id: ${newOrgId}`
            })
        }

        return newOrg.slug
    } catch (error: unknown) {
        return handleDomainException(error)
    }
})
