import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Limit } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Limit}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new limit and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newLimit = em.create(Limit, {
            reqId: await getNextReqId('G.6.', em, solution) as Limit['reqId'],
            name,
            description,
            modifiedBy: sessionUser,
            createdBy: sessionUser,
            lastModified: new Date(),
            isSilence
        })

        em.create(Belongs, {
            left: newLimit,
            right: solution
        })

        await em.flush()

        return newLimit.id
    })

    return newId
})