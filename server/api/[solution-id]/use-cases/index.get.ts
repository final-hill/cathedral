import { z } from "zod"
import { fork } from "~/server/data/orm"
import { MoscowPriority, UseCase } from "~/server/domain/requirements/index.js"
import { NIL as emptyUuid } from "uuid"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
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
    const { solutionId } = await validateEventParams(event, paramSchema),
        query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, solutionId)

    const results = await em.find(UseCase, Object.entries(query)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {} as Record<string, any>));

    return results
})