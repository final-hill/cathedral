// Description: This file handles the editing of a proposed requirement in the system. It validates the request parameters and body, checks permissions, and updates the requirement in the database.
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~/application'
import { OrganizationRepository, RequirementRepository } from '~/server/data/repositories'
import { Organization, ReqType, Solution } from '~/shared/domain'
import { snakeCaseToPascalCase } from '~/shared/utils'
import * as req from '#shared/domain/requirements'
import { z } from 'zod'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = z.object({
    reqType: z.nativeEnum(ReqType),
    id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
    const { reqType, id } = await validateEventParams(event, paramSchema)

    if (reqType === ReqType.PARSED_REQUIREMENTS)
        throw new Error('ReqType.PARSED_REQUIREMENTS is not allowed.')

    const ReqPascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
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
            return value.organizationId !== undefined || value.organizationSlug !== undefined
        }, 'At least one of organizationId or organizationSlug should be provided'),
        { solutionSlug, organizationId: orgId, organizationSlug: orgSlug, ...reqProps } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: createEntraGroupService()
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

    return requirementInteractor.updateProposedRequirement({ id, ...reqProps })
        .catch(handleDomainException)
})
