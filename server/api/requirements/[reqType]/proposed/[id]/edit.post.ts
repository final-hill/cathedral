// Description: This file handles the editing of a proposed requirement in the system. It validates the request parameters and body, checks permissions, and updates the requirement in the database.
import { getServerSession } from '#auth'
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from "~/application"
import { AppUserRepository, OrganizationRepository, PermissionRepository, RequirementRepository } from '~/server/data/repositories'
import { Organization, ReqType, Solution } from '~/shared/domain'
import { snakeCaseToPascalCase } from '~/shared/utils';
import * as req from "#shared/domain/requirements";
import { z } from 'zod'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = z.object({
    reqType: z.nativeEnum(ReqType),
    id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    const { reqType, id } = await validateEventParams(event, paramSchema),
        ReqPascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
        ReqCons = req[ReqPascal] as typeof req.Requirement,
        bodySchema = ReqCons.partial().omit({
            createdBy: true,
            creationDate: true,
            isDeleted: true,
            lastModified: true,
            modifiedBy: true,
            reqId: true,
            workflowState: true,
            reqType: true,
            solution: true
        }).extend({
            solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
            organizationId,
            organizationSlug
        }).refine((value) => {
            return value.organizationId !== undefined || value.organizationSlug !== undefined;
        }, "At least one of organizationId or organizationSlug should be provided"),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug, ...reqProps } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        permissionInteractor = new PermissionInteractor({
            userId: session.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId: orgId,
                organizationSlug: orgSlug
            }),
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
        })

    return requirementInteractor.updateProposedRequirement({ id, ...reqProps })
        .catch(handleDomainException)
})
