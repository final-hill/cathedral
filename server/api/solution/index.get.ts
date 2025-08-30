import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~~/server/application'
import { OrganizationRepository } from '~~/server/data/repositories'
import { Organization, Solution } from '~~/shared/domain'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        ...Solution.innerType().pick({ name: true, description: true, slug: true }).partial().shape,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns all solutions that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug, slug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({ permissionInteractor, entraService }),
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    return await organizationInteractor.findSolutions({ description, name, slug }).catch(handleDomainException)
})
