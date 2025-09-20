import { Organization, Solution } from '#shared/domain'
import { z } from 'zod'

const { id: organizationIdSchema, slug: organizationSlugSchema } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({
        id: z.string().uuid()
    })

export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        bodySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId: organizationIdSchema,
            organizationSlug: organizationSlugSchema
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided'),
        { solutionSlug, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        requirementInteractor = await createRequirementInteractor({
            event,
            session,
            organizationId,
            organizationSlug,
            solutionSlug
        })

    return requirementInteractor.editActiveRequirement(id)
        .catch(handleDomainException)
})
