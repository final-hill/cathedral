// Get the current Active requirements by type
import { Organization, ReqType, Solution } from '#shared/domain'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({ reqType: z.nativeEnum(ReqType) }),
    querySchema = z.object({
        solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
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
        })

    return requirementInteractor.getCurrentActiveRequirementsByType(reqType)
        .catch(handleDomainException)
})
