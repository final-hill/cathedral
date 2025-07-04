import { z } from "zod";
import handleDomainException from "~/server/utils/handleDomainException"
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from "~/application";
import { AppUserRepository, OrganizationRepository, PermissionRepository, RequirementRepository } from "~/server/data/repositories";
import { ReqType } from "#shared/domain/requirements/ReqType";
import { Organization, Solution } from "#shared/domain";

const querySchema = z.object({
    solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
    organizationSlug: Organization.innerType().pick({ slug: true }).shape.slug,
    reqType: z.nativeEnum(ReqType)
})

export default defineEventHandler(async (event) => {
    const { solutionSlug, organizationSlug, reqType } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            userId: session.user.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug }),
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                repository: new AppUserRepository({ em: event.context.em })
            }),
            permissionInteractor
        }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em: event.context.em }),
            permissionInteractor,
            organizationId: org.id,
            solutionId: solution.id
        })

    return await requirementInteractor.getCurrentActiveRequirementsByType(reqType)
        .then(requirements => requirements.map(req => ({ label: req.name, value: { id: req.id, name: req.name } })))
        .catch(handleDomainException)
})