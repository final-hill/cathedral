import { z } from "zod"
import { fork } from "~/server/data/orm"
import { EnvironmentComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * Returns all environment-components that match the optional query parameters
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, solutionId)

    const results = await em.find(EnvironmentComponent, Object.entries(query)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {}))

    return results
})