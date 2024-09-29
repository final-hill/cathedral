import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Effect } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Effect}"),
    statement: z.string().default("")
})

/**
 * Creates a new effect and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newEffect = new Effect({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(newEffect)

    return newEffect.id
})