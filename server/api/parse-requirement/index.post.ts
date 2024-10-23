import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod";
import zodToJsonSchema from "zod-to-json-schema";
import { AzureOpenAI } from "openai";
import zodSchema from '../../data/llm-zod-schemas/index.js'
import { fork } from "~/server/data/orm.js";
import { v7 as uuidv7 } from 'uuid';
import {
    Assumption, Constraint, ConstraintCategory, Effect, EnvironmentComponent, FunctionalBehavior,
    GlossaryTerm, Invariant, Justification, Limit, MoscowPriority, NonFunctionalBehavior, Obstacle,
    Outcome, ParsedRequirement, Person, Stakeholder, StakeholderCategory, StakeholderSegmentation,
    SystemComponent, UseCase, UserStory
} from "~/domain/requirements/index.js";
import { Belongs } from "~/domain/relations/Belongs.js";
import { Follows } from "~/domain/relations/Follows.js";

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    statement: z.string().max(1000, 'Requirement must be less than or equal to 1000 characters')
})

const config = useRuntimeConfig()

/**
 * Parse requirements from a statement, save the parsed requirements to the database,
 * and return the number of requirements parsed.
 */
export default defineEventHandler(async (event) => {
    const { statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const aiClient = new AzureOpenAI({
        apiKey: config.azureOpenaiApiKey,
        apiVersion: config.azureOpenaiApiVersion,
        endpoint: config.azureOpenaiEndpoint
    })

    // https://techcommunity.microsoft.com/t5/ai-azure-ai-services-blog/introducing-gpt-4o-2024-08-06-api-with-structured-outputs-on/ba-p/4232684
    // https://hooshmand.net/zod-zodresponseformat-structured-outputs-openai/
    // https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/structured-outputs?tabs=python-secure
    const completion = await aiClient.beta.chat.completions.parse({
        // temperature: 0,
        model: config.azureOpenaiDeploymentId,
        messages: [
            {
                role: "system",
                content: dedent(`
                    Your role is to parse Requirements from user input and derive any strongly implied requirements.
                    Requirements are defined by the following json schema:

                    """
                    ${zodToJsonSchema(zodSchema, 'requirements')}
                    """

                    Any statement or substatement that can not be expressed or understood should be considered a Silence.
                `)
            },
            {
                role: "user",
                content: statement
            }
        ],
        response_format: zodResponseFormat(zodSchema, 'requirements')
    })

    const result = (completion.choices[0].message.parsed?.requirements ?? [])
        .map((req) => ({ ...req, id: uuidv7() }));

    type ArrayToUnion<T> = T extends (infer U)[] ? U : never
    type ExtractGroupItem<T extends string> = Extract<ArrayToUnion<typeof result>, { type: T }>
    type GroupedResult = {
        [K in ArrayToUnion<typeof result>['type']]?: ExtractGroupItem<K>[]
    }

    const groupedResult = groupBy(result, ({ type }) => type) as GroupedResult

    const parsedRequirement = em.create(ParsedRequirement, {
        name: '{LLM Parsed Requirement}',
        description: statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence: true
    })

    em.create(Belongs, { left: parsedRequirement, right: solution });

    (groupedResult.Assumption ?? []).forEach((item) => {
        const assumption = em.create(Assumption, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: assumption, right: solution });
        em.create(Follows, { left: assumption, right: parsedRequirement });
    });
    (groupedResult.Constraint ?? []).forEach((item) => {
        const constraint = em.create(Constraint, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description,
            category: item.category as ConstraintCategory
        })
        em.create(Belongs, { left: constraint, right: solution });
        em.create(Follows, { left: constraint, right: parsedRequirement });
    });
    (groupedResult.Effect ?? []).forEach((item) => {
        const effect = em.create(Effect, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: effect, right: solution });
        em.create(Follows, { left: effect, right: parsedRequirement });
    });
    (groupedResult.EnvironmentComponent ?? []).forEach((item) => {
        const environmentComponent = em.create(EnvironmentComponent, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: environmentComponent, right: solution });
        em.create(Follows, { left: environmentComponent, right: parsedRequirement });
    });
    (groupedResult.FunctionalBehavior ?? []).forEach((item) => {
        const functionalBehavior = em.create(FunctionalBehavior, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description,
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST
        })
        em.create(Belongs, { left: functionalBehavior, right: solution });
        em.create(Follows, { left: functionalBehavior, right: parsedRequirement });
    });
    (groupedResult.GlossaryTerm ?? []).forEach((item) => {
        const glossaryTerm = em.create(GlossaryTerm, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: glossaryTerm, right: solution });
        em.create(Follows, { left: glossaryTerm, right: parsedRequirement });
    });
    (groupedResult.Invariant ?? []).forEach((item) => {
        const invariant = em.create(Invariant, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: invariant, right: solution });
        em.create(Follows, { left: invariant, right: parsedRequirement });
    });
    (groupedResult.Justification ?? []).forEach((item) => {
        const justifications = em.create(Justification, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: justifications, right: solution });
        em.create(Follows, { left: justifications, right: parsedRequirement });
    });
    (groupedResult.Limit ?? []).forEach((item) => {
        const limit = em.create(Limit, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: limit, right: solution });
        em.create(Follows, { left: limit, right: parsedRequirement });
    });
    (groupedResult.NonFunctionalBehavior ?? []).forEach((item) => {
        const nonFunctionalBehavior = em.create(NonFunctionalBehavior, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description,
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST
        })
        em.create(Belongs, { left: nonFunctionalBehavior, right: solution });
        em.create(Follows, { left: nonFunctionalBehavior, right: parsedRequirement });
    });
    (groupedResult.Obstacle ?? []).forEach((item) => {
        const obstacle = em.create(Obstacle, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: obstacle, right: solution });
        em.create(Follows, { left: obstacle, right: parsedRequirement });
    });
    (groupedResult.Outcome ?? []).forEach((item) => {
        const outcome = em.create(Outcome, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: outcome, right: solution });
        em.create(Follows, { left: outcome, right: parsedRequirement });
    });
    (groupedResult.Person ?? []).forEach((item) => {
        const person = em.create(Person, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description,
            email: item.email
        })
        em.create(Belongs, { left: person, right: solution });
        em.create(Follows, { left: person, right: parsedRequirement });
    });
    (groupedResult.Stakeholder ?? []).forEach((item) => {
        const stakeholder = em.create(Stakeholder, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            availability: item.availability,
            influence: item.influence,
            description: '',
            category: item.category as StakeholderCategory,
            segmentation: item.segmentation as StakeholderSegmentation
        })
        em.create(Belongs, { left: stakeholder, right: solution });
        em.create(Follows, { left: stakeholder, right: parsedRequirement });
    });
    (groupedResult.SystemComponent ?? []).forEach((item) => {
        const systemComponent = em.create(SystemComponent, {
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: item.description
        })
        em.create(Belongs, { left: systemComponent, right: solution });
        em.create(Follows, { left: systemComponent, right: parsedRequirement });
    });
    (groupedResult.UseCase ?? []).forEach((item) => {
        const useCase = em.create(UseCase, {
            isSilence: true,
            extensions: item.extensions,
            goalInContext: item.goalInContext,
            level: item.level,
            mainSuccessScenario: item.mainSuccessScenario,
            scope: item.scope,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: '',
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
            // triggerId: undefined,
            precondition: em.create(Assumption, {
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.name,
                description: item.precondition
            }),
            successGuarantee: em.create(Effect, {
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.name,
                description: item.successGuarantee
            }),
            primaryActor: em.create(Stakeholder, {
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.primaryActor,
                availability: 50,
                influence: 50,
                description: '',
                category: StakeholderCategory.KEY_STAKEHOLDER,
                segmentation: StakeholderSegmentation.VENDOR,
            })
        })
        em.create(Belongs, { left: useCase, right: solution });
        em.create(Follows, { left: useCase, right: parsedRequirement });

        em.create(Belongs, { left: useCase.precondition!, right: solution });
        em.create(Belongs, { left: useCase.successGuarantee!, right: solution });
        em.create(Belongs, { left: useCase.primaryActor!, right: solution });
    });
    (groupedResult.UserStory ?? []).forEach((item) => {
        const userStory = em.create(UserStory, {
            isSilence: true,
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            description: '',
            functionalBehavior: em.create(FunctionalBehavior, {
                isSilence: true,
                priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.functionalBehavior,
                description: item.functionalBehavior
            }),
            outcome: em.create(Outcome, {
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.outcome,
                description: item.outcome
            }),
            primaryActor: em.create(Stakeholder, {
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.role,
                availability: 50,
                influence: 50,
                description: '',
                category: StakeholderCategory.KEY_STAKEHOLDER,
                segmentation: StakeholderSegmentation.VENDOR
            })
        })
        em.create(Belongs, { left: userStory, right: solution });
        em.create(Follows, { left: userStory, right: parsedRequirement });
        em.create(Belongs, { left: userStory.functionalBehavior!, right: solution });
        em.create(Belongs, { left: userStory.outcome!, right: solution });
        em.create(Belongs, { left: userStory.primaryActor!, right: solution });
    });

    await em.flush()

    return result.length ?? 0
})