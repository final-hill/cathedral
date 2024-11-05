import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Outcome } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Outcome}"),
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

    const newId = await em.transactional(async (em) => {
        const newOutcome = em.create(Outcome, {
            reqId: await getNextReqId('G.1.', em, solution) as Outcome['reqId'],
            name,
            description,
            modifiedBy: sessionUser,
            createdBy: sessionUser,
            lastModified: new Date(),
            isSilence
        })

        em.create(Belongs, {
            left: newOutcome,
            right: solution
        })

        await em.flush()

        return newOutcome.id
    })

    return newId
})