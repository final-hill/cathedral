// Create a proposed requirement
import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '~/application'
import { OrganizationRepository, RequirementRepository } from '~/server/data/repositories'
import { Organization, ReqType, Solution } from '~/shared/domain'
import { snakeCaseToPascalCase } from '~/shared/utils'
import * as req from '#shared/domain/requirements'
import { z } from 'zod'
import { NaturalLanguageToRequirementService } from '~/server/data/services/NaturalLanguageToRequirementService'
import { createEntraService } from '~/server/utils/createEntraService'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    paramSchema = z.object({ reqType: z.nativeEnum(ReqType) }),
    appConfig = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    const { reqType } = await validateEventParams(event, paramSchema),
        ReqPascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
        ReqCons = req[ReqPascal] as typeof req.Requirement,
        innerSchema = (ReqCons as unknown) instanceof z.ZodEffects
            ? (ReqCons as unknown as z.ZodEffects<z.ZodTypeAny>)._def.schema
            : ReqCons,
        bodySchema = (innerSchema as typeof req.Requirement).omit({
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
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({
                em: event.context.em,
                organizationId: orgId,
                organizationSlug: orgSlug
            }),
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
