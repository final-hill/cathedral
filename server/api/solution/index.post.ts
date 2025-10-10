import { z } from 'zod'
import { Organization, Solution } from '#shared/domain'

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
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug })

    try {
        const newSolutionId = (await organizationInteractor.addSolution({ name, description }))!,
            newSolution = (await organizationInteractor.getSolutionById(newSolutionId))!

        return newSolution.slug
    } catch (error: unknown) {
        return handleDomainException(error)
    }
})
