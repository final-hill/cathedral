import { z } from "zod"
import { getServerSession } from '#auth'
import { fork } from "~/server/data/orm.js";
import { OrganizationInteractor } from "~/application/OrganizationInteractor.js";
import NaturalLanguageToRequirementService from "~/server/data/services/NaturalLanguageToRequirementService.js";

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    organizationSlug: z.string(),
    statement: z.string().max(1000, 'Requirement must be less than or equal to 1000 characters')
})

const config = useRuntimeConfig()

/**
 * Parse requirements from a statement, save the parsed requirements to the database,
 * and return the number of requirements parsed.
 */
export default defineEventHandler(async (event) => {
    const { statement, solutionId, organizationSlug } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            organizationSlug,
            entityManager: fork()
        }),
        naturalLanguageToRequirementService = new NaturalLanguageToRequirementService({
            apiKey: config.azureOpenaiApiKey,
            apiVersion: config.azureOpenaiApiVersion,
            endpoint: config.azureOpenaiEndpoint,
            modelId: config.azureOpenaiDeploymentId
        })

    return organizationInteractor.parseRequirement({
        parsingService: naturalLanguageToRequirementService,
        solutionId,
        statement
    })
})