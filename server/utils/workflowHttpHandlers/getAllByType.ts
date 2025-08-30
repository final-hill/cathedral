import handleDomainException from '../handleDomainException'
import { z } from 'zod'
import { Organization, ReqType, Solution } from '~~/shared/domain'
import { OrganizationRepository, RequirementRepository } from '~~/server/data/repositories'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~~/server/application'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

export default function getAllByType() {
    const paramSchema = z.object({ reqType: z.nativeEnum(ReqType) }),
        validatedQuerySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug,
            parsedReqParentId: z.string().optional()
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided')

    return defineEventHandler(async (event) => {
        const { reqType } = await validateEventParams(event, paramSchema),
            { solutionSlug, organizationId, organizationSlug, parsedReqParentId } = await validateEventQuery(event, validatedQuerySchema),
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

        return requirementInteractor.getAllRequirementsByType({
            reqType,
            staticQuery: {
                // @ts-expect-error - a direct ID is legal for the ORM
                parsedRequirements: parsedReqParentId
            }
        }).catch(handleDomainException)
    })
}
