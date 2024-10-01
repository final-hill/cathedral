import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod";
import zodToJsonSchema from "zod-to-json-schema";
import { AzureOpenAI } from "openai";
import zodSchema from '../../data/llm-zod-schemas'
import { fork } from "~/server/data/orm";
import { v7 as uuidv7 } from 'uuid';
import {
    Assumption, Constraint, ConstraintCategory, Effect, EnvironmentComponent, FunctionalBehavior,
    GlossaryTerm, Invariant, Justification, Limit, MoscowPriority, NonFunctionalBehavior, Obstacle,
    Outcome, ParsedRequirement, Person, Stakeholder, StakeholderCategory, StakeholderSegmentation,
    SystemComponent, UseCase, UserStory
} from "~/server/domain/requirements";

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

    // The server is currently Node 20 which does not support Object.groupBy.
    // See: https://github.com/final-hill/cathedral/issues/371
    if (!Object.groupBy) {
        Object.groupBy = function <K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Partial<Record<K, T[]>> {
            return [...items].reduce((acc, item, index) => {
                const key = keySelector(item, index),
                    group = (acc as any)[key as any] ?? ((acc as any)[key as any] = [])
                group.push(item)
                return acc
            }, {} as Partial<Record<K, T[]>>)
        }
    }

    const groupedResult = Object.groupBy(result, ({ type }) => type) as GroupedResult

    const parsedRequirement = em.create(ParsedRequirement, {
        name: '{LLM Parsed Requirement}',
        solution,
        statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence: true,
        assumptions: [],
        constraints: [],
        effects: [],
        environmentComponents: [],
        functionalBehaviors: [],
        glossaryTerms: [],
        invariants: [],
        justifications: [],
        limits: [],
        nonFunctionalBehaviors: [],
        obstacles: [],
        outcomes: [],
        persons: [],
        stakeholders: [],
        systemComponents: [],
        useCases: [],
        userStories: []
    })

    Object.assign(parsedRequirement, {
        assumptions: (groupedResult.Assumption ?? []).map((item) => em.create(Assumption, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        constraints: (groupedResult.Constraint ?? []).map((item) => em.create(Constraint, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement,
            category: item.category as ConstraintCategory
        })),
        effects: (groupedResult.Effect ?? []).map((item) => em.create(Effect, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        environmentComponents: (groupedResult.EnvironmentComponent ?? []).map((item) => em.create(EnvironmentComponent, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement,
            parentComponent: undefined
        })),
        functionalBehaviors: (groupedResult.FunctionalBehavior ?? []).map((item) => em.create(FunctionalBehavior, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement,
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST
        })),
        glossaryTerms: (groupedResult.GlossaryTerm ?? []).map((item) => em.create(GlossaryTerm, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.description,
            parentComponent: undefined
        })),
        invariants: (groupedResult.Invariant ?? []).map((item) => em.create(Invariant, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        justifications: (groupedResult.Justification ?? []).map((item) => em.create(Justification, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        limits: (groupedResult.Limit ?? []).map((item) => em.create(Limit, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        nonFunctionalBehaviors: (groupedResult.NonFunctionalBehavior ?? []).map((item) => em.create(NonFunctionalBehavior, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement,
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST
        })),
        obstacles: (groupedResult.Obstacle ?? []).map((item) => em.create(Obstacle, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        outcomes: (groupedResult.Outcome ?? []).map((item) => em.create(Outcome, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement
        })),
        persons: (groupedResult.Person ?? []).map((item) => em.create(Person, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement,
            email: item.email
        })),
        stakeholders: (groupedResult.Stakeholder ?? []).map((item) => em.create(Stakeholder, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            availability: item.availability,
            influence: item.influence,
            statement: '',
            category: item.category as StakeholderCategory,
            parentComponent: undefined,
            segmentation: item.segmentation as StakeholderSegmentation,
            solution
        })),
        systemComponents: (groupedResult.SystemComponent ?? []).map((item) => em.create(SystemComponent, {
            follows: parsedRequirement,
            isSilence: true,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: item.statement,
            parentComponent: undefined
        })),
        useCases: (groupedResult.UseCase ?? []).map((item) => em.create(UseCase, {
            follows: parsedRequirement,
            isSilence: true,
            extensions: item.extensions,
            goalInContext: item.goalInContext,
            level: item.level,
            mainSuccessScenario: item.mainSuccessScenario,
            scope: item.scope,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: '',
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
            // triggerId: undefined,
            precondition: em.create(Assumption, {
                follows: parsedRequirement,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.name,
                solution,
                statement: item.precondition
            }),
            successGuarantee: em.create(Effect, {
                follows: parsedRequirement,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.name,
                solution,
                statement: item.successGuarantee
            }),
            primaryActor: em.create(Stakeholder, {
                follows: parsedRequirement,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.primaryActor,
                availability: 50,
                influence: 50,
                statement: '',
                category: StakeholderCategory.KEY_STAKEHOLDER,
                parentComponent: undefined,
                segmentation: StakeholderSegmentation.VENDOR,
                solution
            })
        })),
        userStories: (groupedResult.UserStory ?? []).map((item) => em.create(UserStory, {
            follows: parsedRequirement,
            isSilence: true,
            priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            name: item.name,
            solution,
            statement: '',
            functionalBehavior: em.create(FunctionalBehavior, {
                follows: parsedRequirement,
                isSilence: true,
                priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.functionalBehavior,
                solution,
                statement: item.functionalBehavior
            }),
            outcome: em.create(Outcome, {
                follows: parsedRequirement,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.outcome,
                solution,
                statement: item.outcome
            }),
            primaryActor: em.create(Stakeholder, {
                follows: parsedRequirement,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: sessionUser,
                name: item.role,
                availability: 50,
                influence: 50,
                statement: '',
                category: StakeholderCategory.KEY_STAKEHOLDER,
                parentComponent: undefined,
                segmentation: StakeholderSegmentation.VENDOR,
                solution
            })
        }))
    })

    await em.flush()

    return result.length ?? 0
})