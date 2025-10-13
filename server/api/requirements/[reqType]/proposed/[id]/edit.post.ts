// This file handles the editing of a proposed requirement in the system. It validates the request parameters and body, checks permissions, and updates the requirement in the database.
import { Organization, ReqType, Solution } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({
        reqType: z.nativeEnum(ReqType),
        id: z.string().uuid()
    })

export default defineEventHandler(async (event) => {
    const { reqType, id } = await validateEventParams({ event, schema: paramSchema }),
        ReqPascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
        ReqCons = req[ReqPascal] as typeof req.Requirement,
        innerSchema = (ReqCons as unknown) instanceof z.ZodEffects
            ? (ReqCons as unknown as z.ZodEffects<z.ZodTypeAny>)._def.schema
            : ReqCons,
        bodySchema = (innerSchema as typeof req.Requirement).partial().omit({
            createdBy: true,
            creationDate: true,
            isDeleted: true,
            lastModified: true,
            modifiedBy: true,
            reqId: true,
            workflowState: true,
            reqType: true,
            solution: true
        }).extend({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided'),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug, ...reqProps } = await validateEventBody({ event, schema: bodySchema }),
        session = await requireUserSession(event),
        requirementInteractor = await createRequirementInteractor({
            event,
            session,
            organizationId: orgId,
            organizationSlug: orgSlug,
            solutionSlug
        })

    return requirementInteractor.updateProposedRequirement({ id, ...reqProps })
        .catch(handleDomainException)
})
