import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories'
import { createEntraService } from '~/server/utils/createEntraService'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization } from '~/shared/domain'

const paramSchema = Organization.innerType().pick({ slug: true })

/**
 * Returns an organization by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug: slug }),
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({ permissionInteractor, entraService })
        })

    return await organizationInteractor.getOrganization().catch(handleDomainException)
})
