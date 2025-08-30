import { z } from 'zod'
import { Organization, Solution } from '#shared/domain'
import { PermissionInteractor, OrganizationInteractor, AppUserInteractor } from '~~/server/application'
import { OrganizationRepository } from '~~/server/data/repositories'
import { createEntraService } from '~~/server/utils/createEntraService'
import handleDomainException from '~~/server/utils/handleDomainException'

const paramSchema = Solution.innerType().pick({ slug: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({ permissionInteractor, entraService }),
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    return await organizationInteractor.getSolutionBySlug(slug).catch(handleDomainException)
})
