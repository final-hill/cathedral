// Check if a specific requirement type is missing active items for minimum requirements
import { Organization, Solution, ReqType } from '#shared/domain'
import { MINIMUM_REQUIREMENT_TYPES } from '#shared/domain/requirements/minimumRequirements'
import { createRequirementInteractor } from '~~/server/utils/createRequirementInteractor'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({ reqType: z.enum(ReqType) }),
    querySchema = z.object({
        solutionSlug: Solution.pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

export default defineEventHandler(async (event) => {
    const { reqType } = await validateEventParams({ event, schema: paramSchema }),
        { solutionSlug, organizationId, organizationSlug } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        requirementInteractor = await createRequirementInteractor({
            event,
            session,
            organizationId,
            organizationSlug,
            solutionSlug
        }),
        isMinimumRequirement = MINIMUM_REQUIREMENT_TYPES.includes(reqType)

    if (!isMinimumRequirement)
        return false

    return requirementInteractor.hasActiveRequirements(reqType)
        .then(hasActive => !hasActive)
        .catch(handleDomainException)
})
