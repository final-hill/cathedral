import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string()
})

/**
 * Creates a new assumption and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        { name, statement } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId)

    const em = fork(),
        newAssumption = new Assumption({
            name,
            statement,
            solution,
            modifiedBy: sessionUser,
            lastModified: new Date()
        })

    await em.persistAndFlush(newAssumption)

    return newAssumption.id
})