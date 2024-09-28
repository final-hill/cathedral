import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Obstacle } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Obstacle}"),
    statement: z.string().default("")
})

/**
 * Creates a new obstacle and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newObstacle = new Obstacle({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(newObstacle)

    return newObstacle.id
})