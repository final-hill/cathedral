import { z } from 'zod'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~~/server/application'
import { OrganizationRepository, RequirementRepository } from '~~/server/data/repositories'
import { ReqType } from '#shared/domain/requirements/ReqType'
import { Organization, Solution } from '#shared/domain'

const querySchema = z.object({
    solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
    organizationSlug: Organization.innerType().pick({ slug: true }).shape.slug,
    reqType: z.nativeEnum(ReqType)
})

export default defineEventHandler(async (event) => {
    const { solutionSlug, organizationSlug, reqType } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug }),
            appUserInteractor,
            permissionInteractor
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

    return await requirementInteractor.getAllVisibleRequirementsByType(reqType)
        .then(requirements => requirements.map(req => ({
            label: `${req.name} (${req.workflowState})`,
            value: { id: req.id, name: req.name }
        })))
        .catch(handleDomainException)
})
