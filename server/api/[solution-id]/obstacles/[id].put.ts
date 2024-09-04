import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Obstacle } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string()
})

/**
 * Updates an obstacle by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, statement } = await validateEventBody(event, bodySchema),
        em = fork()

    const obstacle = await em.findOne(Obstacle, id)

    if (!obstacle)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    obstacle.name = name
    obstacle.statement = statement
    obstacle.modifiedBy = sessionUser

    await em.flush()
})