import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application/index'
import { OrganizationCollectionRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '#shared/domain'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const bodySchema = Organization.innerType().pick({ name: true, description: true })

/**
 * Creates a new organization and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { name, description } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        entraGroupService = createEntraGroupService(),
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: entraGroupService
        }),
        organizationCollectionInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor,
            entraGroupService
        })

    console.log('Creating organization. with session: ', session)

    try {
        const newOrgId = await organizationCollectionInteractor.createOrganization({ name, description })

        console.log(`Organization created with ID: ${newOrgId}`)

        // Try to find the organization
        const organizations = await organizationCollectionInteractor.findOrganizations({ id: newOrgId! })
        console.log(`Found ${organizations.length} organizations with ID: ${newOrgId}`)

        const newOrg = organizations[0]

        if (!newOrg) {
            console.error(`Failed to find newly created organization for id: ${newOrgId}`)
            throw createError({
                status: 500,
                message: `Failed to find newly created organization for id: ${newOrgId}`
            })
        }

        console.log(`Returning organization slug: ${newOrg.slug}`)
        return newOrg.slug
    } catch (error: unknown) {
        return handleDomainException(error)
    }
})
