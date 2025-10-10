import handleDomainException from '../handleDomainException'
import { z } from 'zod'
import { Organization, ReqType, Solution } from '#shared/domain'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

export default function getAllByType() {
    const paramSchema = z.object({ reqType: z.nativeEnum(ReqType) }),
        validatedQuerySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).passthrough().refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided')

    return defineEventHandler(async (event) => {
        const { reqType } = await validateEventParams(event, paramSchema),
            { solutionSlug, organizationId, organizationSlug, ...query } = await validateEventQuery(event, validatedQuerySchema),
            session = await requireUserSession(event),
            requirementInteractor = await createRequirementInteractor({ event, session, organizationId, organizationSlug, solutionSlug })

        return requirementInteractor.getAllRequirementsByType({
            reqType,
            query
        }).catch((error) => {
            console.error('[getAllByType] Error caught:', error)
            return handleDomainException(error)
        })
    })
}
