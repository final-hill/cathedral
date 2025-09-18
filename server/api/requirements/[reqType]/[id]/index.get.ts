import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~~/server/application'
import { OrganizationRepository, RequirementRepository } from '~~/server/data/repositories'
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
    const { reqType, id } = await validateEventParams(event, paramSchema),
        { solutionSlug, organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
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

    return requirementInteractor.getRequirementTypeById({ id, reqType }).catch(handleDomainException)
})
