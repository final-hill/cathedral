import { z } from "zod"
import { fork } from "~/server/data/orm"
import MoscowPriority from "~/server/domain/MoscowPriority"
import UseCase from "~/server/domain/UseCase"
import { emptyUuid, type Uuid } from "~/server/domain/Uuid"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    scope: z.string().optional(),
    level: z.string().optional(),
    goalInContext: z.string().optional(),
    preconditionId: z.string().uuid().optional(),
    triggerId: z.literal(emptyUuid).optional(),
    mainSuccessScenario: z.string().optional(),
    successGuaranteeId: z.string().uuid().optional(),
    extensions: z.string().optional()
})

/**
 * Returns all stakeholders that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await em.find(UseCase, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value as Uuid };
            return { ...acc, [key]: { $eq: value } };
        }, {} as Record<string, any>));

    return results
})
