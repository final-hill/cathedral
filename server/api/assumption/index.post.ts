import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Assumption}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new assumption and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newAssumption = em.create(Assumption, {
        name,
        description,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    em.create(Belongs, { left: newAssumption, right: solution })

    await em.flush()

    return newAssumption.id
})