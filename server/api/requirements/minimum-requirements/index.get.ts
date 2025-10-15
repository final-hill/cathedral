// Get missing minimum requirements for a solution
import { Organization, Solution } from '#shared/domain'
import { createRequirementInteractor } from '~~/server/utils/createRequirementInteractor'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        solutionSlug: Solution.pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

export default defineEventHandler(async (event) => {
    const { solutionSlug, organizationId, organizationSlug } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        requirementInteractor = await createRequirementInteractor({
            event,
            session,
            organizationId,
            organizationSlug,
            solutionSlug
        })

    return requirementInteractor.getMissingMinimumRequirements()
        .catch(handleDomainException)
})
