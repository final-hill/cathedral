import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Justification } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Justification}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new justifications and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newJustification = em.create(Justification, {
        name,
        description,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    em.create(Belongs, { left: newJustification, right: solution })

    await em.flush()

    return newJustification.id
})