import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Assumption}"),
    statement: z.string().default("")
})

/**
 * Creates a new assumption and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId } = await validateEventBody(event, bodySchema),
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