import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Effect } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Effect}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new effect and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newEffect = em.create(Effect, {
            reqId: await getNextReqId('E.5.', em, solution) as Effect['reqId'],
            name,
            description,
            createdBy: sessionUser,
            modifiedBy: sessionUser,
            lastModified: new Date(),
            isSilence
        })

        em.create(Belongs, {
            left: newEffect,
            right: solution
        })

        await em.flush()

        return newEffect.id
    })

    return newId
})