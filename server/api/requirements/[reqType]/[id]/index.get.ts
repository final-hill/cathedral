import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from "~/application";
import { AppUserRepository, OrganizationRepository, PermissionRepository, RequirementRepository } from '~/server/data/repositories';
import handleDomainException from '~/server/utils/handleDomainException';
import { Organization, ReqType, Solution } from '~/shared/domain';
import { z } from 'zod';

const paramSchema = z.object({
    reqType: z.nativeEnum(ReqType),
    id: z.string().uuid()
});

const querySchema = z.object({
    solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
    organizationId: Organization.innerType().pick({ id: true }).shape.id.optional(),
    organizationSlug: Organization.innerType().pick({ slug: true }).shape.slug.optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

export default defineEventHandler(async (event) => {
    const { reqType, id } = await validateEventParams(event, paramSchema);
    const { solutionSlug, organizationId, organizationSlug } = await validateEventQuery(event, querySchema);
    const session = await requireUserSession(event);

    const permissionInteractor = new PermissionInteractor({
        userId: session.user.id,
        repository: new PermissionRepository({ em: event.context.em })
    });

    const organizationInteractor = new OrganizationInteractor({
        repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
        permissionInteractor,
        appUserInteractor: new AppUserInteractor({
            permissionInteractor,
            repository: new AppUserRepository({ em: event.context.em })
        })
    });

    const org = await organizationInteractor.getOrganization();
    const solution = await organizationInteractor.getSolutionBySlug(solutionSlug);

    const requirementInteractor = new RequirementInteractor({
        repository: new RequirementRepository({ em: event.context.em }),
        permissionInteractor,
        organizationId: org.id,
        solutionId: solution.id
    });

    return requirementInteractor.getRequirementTypeById({ id, reqType }).catch(handleDomainException);
});
