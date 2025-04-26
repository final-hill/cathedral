import { getServerSession } from '#auth'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from "~/application"
import { AppUserRepository, OrganizationRepository, PermissionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"
import { Organization } from "~/shared/domain"

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Returns an organization by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = (await getServerSession(event))!,
        permissionInteractor = new PermissionInteractor({
            userId: session.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug: slug }),
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                repository: new AppUserRepository({
                    em: event.context.em
                })
            })
        })

    return await organizationInteractor.getOrganization().catch(handleDomainException)
})
