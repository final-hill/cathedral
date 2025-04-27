import { getServerSession } from '#auth';
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from "~/application";
import { AppUserRepository, OrganizationRepository, PermissionRepository, RequirementRepository } from '~/server/data/repositories';
import handleDomainException from '../handleDomainException';
import { Organization, ReqType, Solution } from '~/shared/domain';
import { z } from 'zod';

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape;

export default function getAllByType() {
    const paramSchema = z.object({ reqType: z.nativeEnum(ReqType) }),
        validatedQuerySchema = z.object({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined;
        }, "At least one of organizationId or organizationSlug should be provided");

    return defineEventHandler(async (event) => {
        const { reqType } = await validateEventParams(event, paramSchema),
            { solutionSlug, organizationId, organizationSlug } = await validateEventQuery(event, validatedQuerySchema),
            session = (await getServerSession(event))!,
            permissionInteractor = new PermissionInteractor({
                userId: session.id,
                repository: new PermissionRepository({ em: event.context.em })
            }),
            organizationInteractor = new OrganizationInteractor({
                repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
                permissionInteractor,
                appUserInteractor: new AppUserInteractor({
                    permissionInteractor,
                    repository: new AppUserRepository({ em: event.context.em })
                })
            }),
            org = await organizationInteractor.getOrganization(),
            solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
            requirementInteractor = new RequirementInteractor({
                repository: new RequirementRepository({ em: event.context.em }),
                permissionInteractor,
                organizationId: org.id,
                solutionId: solution.id
            });

        return requirementInteractor.getAllRequirementsByType(reqType).catch(handleDomainException);
    });
}
