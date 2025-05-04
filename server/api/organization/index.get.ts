import { OrganizationCollectionInteractor, PermissionInteractor } from '~/application'
import { OrganizationCollectionRepository, PermissionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"
import { Organization } from "#shared/domain"

const querySchema = Organization.innerType().partial()

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventParams(event, querySchema),
        session = (await requireUserSession(event))!,
        orgColInt = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ em: event.context.em }),
            permissionInteractor: new PermissionInteractor({
                userId: session.user.id,
                repository: new PermissionRepository({ em: event.context.em })
            })
        })

    return orgColInt.findOrganizations(query).catch(handleDomainException)
})
