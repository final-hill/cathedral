// Create a proposed requirement
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~/application'
import { OrganizationRepository, RequirementRepository } from '~/server/data/repositories'
import { Organization, ReqType, Solution } from '~/shared/domain'
import { snakeCaseToPascalCase } from '~/shared/utils'
import * as req from '#shared/domain/requirements'
import { z } from 'zod'
import { NaturalLanguageToRequirementService } from '~/server/data/services/NaturalLanguageToRequirementService'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const paramSchema = z.object({ reqType: z.nativeEnum(ReqType) })

const appConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    const { reqType } = await validateEventParams(event, paramSchema),
        ReqPascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
        ReqCons = req[ReqPascal] as typeof req.Requirement,
        bodySchema = ReqCons.omit({
            createdBy: true,
            creationDate: true,
            id: true,
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

    if (reqType === ReqType.PARSED_REQUIREMENTS) {
        const naturalLanguageToRequirementService = new NaturalLanguageToRequirementService({
            apiKey: appConfig.azureOpenaiApiKey,
            apiVersion: appConfig.azureOpenaiApiVersion,
            endpoint: appConfig.azureOpenaiEndpoint,
            deployment: appConfig.azureOpenaiDeploymentId
        })

        return requirementInteractor.parseRequirements({
            service: naturalLanguageToRequirementService,
            name: reqProps.name || 'Free-form requirements',
            statement: reqProps.description
        })
    } else {
        return requirementInteractor.proposeRequirement({
            reqType,
            ...reqProps
        }).catch(handleDomainException)
    }
})
