import { z } from "zod"
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from "~/application"
import { AppUserRepository, OrganizationRepository, PermissionRepository, RequirementRepository } from '~/server/data/repositories';
import handleDomainException from '~/server/utils/handleDomainException';
import { Organization, ReqType, Solution } from '#shared/domain';

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    ...Solution.innerType().pick({ name: true, description: true }).shape,
    organizationId,
    organizationSlug,
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Creates a new solution and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await requireUserSession(event))!,
        permissionInteractor = new PermissionInteractor({
            userId: session.user.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            permissionInteractor,
            appUserInteractor: new AppUserInteractor({
                permissionInteractor,
                repository: new AppUserRepository({
                    em: event.context.em
                })
            }),
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })
        })

    try {
        const newSolutionId = (await organizationInteractor.addSolution({ name, description }))!,
            newSolution = (await organizationInteractor.getSolutionById(newSolutionId))!,
            org = (await organizationInteractor.getOrganization())!,
            requirementInteractor = new RequirementInteractor({
                repository: new RequirementRepository({ em: event.context.em }),
                permissionInteractor,
                organizationId: org.id,
                solutionId: newSolution.id
            })

        // Create the default requirements for the new solution
        await requirementInteractor.proposeRequirement({
            reqType: ReqType.CONTEXT_AND_OBJECTIVE,
            name: 'Context And Objective',
            description: 'Context and Objective'
        })

        await requirementInteractor.proposeRequirement({
            reqType: ReqType.SITUATION,
            name: 'Situation',
            description: 'Situation'
        })

        return newSolution.slug
    } catch (error: any) {
        return handleDomainException(error)
    }
})