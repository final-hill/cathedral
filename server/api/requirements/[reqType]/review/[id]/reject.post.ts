import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~~/server/application'
import { OrganizationRepository, RequirementRepository } from '~~/server/data/repositories'
import { Organization, ReqType, Solution } from '~~/shared/domain'
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({
        reqType: z.nativeEnum(ReqType), // Unused in this handler
        id: z.string().uuid()
    })

export default defineEventHandler(async (event) => {
    const { id, reqType } = await validateEventParams(event, paramSchema)

    if (reqType === ReqType.PARSED_REQUIREMENTS) throw createError({ statusCode: 400, message: 'PARSED_REQUIREMENTS is not a valid reqType for this operation.' })

    if (reqType === ReqType.SILENCE) throw createError({ statusCode: 400, message: 'Silence requirements cannot be rejected as they are already in rejected state.' })

    const bodySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided'),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId: orgId,
                organizationSlug: orgSlug
            }),
            permissionInteractor,
            appUserInteractor
        }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em: event.context.em }),
            permissionInteractor,
            appUserInteractor,
            organizationId: org.id,
            solutionId: solution.id
        })

    return requirementInteractor.rejectRequirement(id)
        .catch(handleDomainException)
})
