import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Obstacle } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Obstacle}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new obstacle and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newObstacle = em.create(Obstacle, {
        name,
        description,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    em.create(Belongs, { left: newObstacle, right: solution })

    await em.flush()

    return newObstacle.id
})