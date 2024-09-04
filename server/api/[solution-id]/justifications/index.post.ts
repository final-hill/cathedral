import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Justification } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string()
})

/**
 * Creates a new justifications and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        { name, statement } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newJustification = new Justification({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(newJustification)

    return newJustification.id
})