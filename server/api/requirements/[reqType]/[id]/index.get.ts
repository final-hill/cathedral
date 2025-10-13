import { Organization, ReqType, Solution } from '#shared/domain'
import { z } from 'zod'

const paramSchema = z.object({
        reqType: z.nativeEnum(ReqType),
        id: z.string().uuid()
    }),
    querySchema = z.object({
        solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
        organizationId: Organization.innerType().pick({ id: true }).shape.id.optional(),
        organizationSlug: Organization.innerType().pick({ slug: true }).shape.slug.optional()
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

export default defineEventHandler(async (event) => {
    const { reqType, id } = await validateEventParams({ event, schema: paramSchema }),
        { solutionSlug, organizationId, organizationSlug } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        requirementInteractor = await createRequirementInteractor({
            event,
            session,
            organizationId,
            organizationSlug,
            solutionSlug
        })

    return requirementInteractor.getRequirementTypeById({ id, reqType }).catch(handleDomainException)
})
