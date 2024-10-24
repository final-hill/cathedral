import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Person } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Anonymous Person}"),
    description: z.string().default(""),
    email: z.string().email().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new person and returns its id
 */
export default defineEventHandler(async (event) => {
    const { email, name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newPerson = em.create(Person, {
        name,
        description,
        email,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    em.create(Belongs, { left: newPerson, right: solution })

    await em.flush()

    return newPerson.id
})