import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Invariant } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Invariant}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new invariant and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newInvariant = em.create(Invariant, {
            reqId: await getNextReqId('E.6.', em, solution) as Invariant['reqId'],
            name,
            description,
            modifiedBy: sessionUser,
            createdBy: sessionUser,
            lastModified: new Date(),
            isSilence
        })

        em.create(Belongs, {
            left: newInvariant,
            right: solution
        })

        await em.flush()

        return newInvariant.id
    })

    return newId
})