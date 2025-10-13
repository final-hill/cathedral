import handleDomainException from '../handleDomainException'
import type { WorkflowState } from '#shared/domain'
import { Organization, ReqType, Solution } from '#shared/domain'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

export default function getLatestByType(workflowState: WorkflowState) {
    const paramSchema = z.object({ reqType: z.nativeEnum(ReqType) }),
        validatedQuerySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided')

    return defineEventHandler(async (event) => {
        const { reqType } = await validateEventParams({ event, schema: paramSchema }),
            { solutionSlug, organizationId, organizationSlug } = await validateEventQuery({ event, schema: validatedQuerySchema }),
            session = await requireUserSession(event),
            requirementInteractor = await createRequirementInteractor({ event, session, organizationId, organizationSlug, solutionSlug })

        return requirementInteractor.getLatestRequirementsByType({
            reqType,
            workflowState
        }).catch(handleDomainException)
    })
}
