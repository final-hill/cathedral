// Get the current Active requirements by type
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~/application'
import { OrganizationRepository, RequirementRepository } from '~/server/data/repositories'
import { Organization, ReqType, Solution } from '~/shared/domain'
import { z } from 'zod'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = z.object({ reqType: z.nativeEnum(ReqType) })

const querySchema = z.object({
    solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

export default defineEventHandler(async (event) => {
    const { reqType } = await validateEventParams(event, paramSchema),
        { solutionSlug, organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            session,
            groupService: createEntraGroupService()
        }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                groupService: createEntraGroupService()
            })
        }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em: event.context.em }),
            permissionInteractor,
            organizationId: org.id,
            solutionId: solution.id
        })

    return requirementInteractor.getCurrentActiveRequirementsByType(reqType)
        .catch(handleDomainException)
})
