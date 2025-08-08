import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization, Solution } from '#shared/domain'
import { createEntraService } from '~/server/utils/createEntraService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    bodySchema = z.object({
        ...Solution.innerType().pick({ name: true, description: true }).shape,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Creates a new solution and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor,
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    try {
        const newSolutionId = (await organizationInteractor.addSolution({ name, description }))!,
            newSolution = (await organizationInteractor.getSolutionById(newSolutionId))!

        return newSolution.slug
    } catch (error: unknown) {
        return handleDomainException(error)
    }
})
