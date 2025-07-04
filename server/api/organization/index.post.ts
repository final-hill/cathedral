import { OrganizationCollectionInteractor, PermissionInteractor } from "~/application/index"
import { OrganizationCollectionRepository, PermissionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"
import { Organization } from "#shared/domain"

const bodySchema = Organization.innerType().pick({ name: true, description: true })

/**
 * Creates a new organization and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { name, description } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        organizationCollectionInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor: new PermissionInteractor({
                userId: session.user.id,
                repository: new PermissionRepository({ em: event.context.em })
            })
        })

    console.log("Creating organization. with session: ", session)

    try {
        const newOrgId = await organizationCollectionInteractor.createOrganization({ name, description }),
            newOrg = (await organizationCollectionInteractor.findOrganizations({ id: newOrgId! }))![0]

        if (!newOrg)
            throw createError({
                status: 500,
                message: `Failed to find newly created organization for id: ${newOrgId}`
            })

        return newOrg.slug
    } catch (error: any) {
        return handleDomainException(error)
    }
})