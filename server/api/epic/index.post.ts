import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Epic, MoscowPriority, ReqType } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Epic}"),
    priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new epic and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence, priority } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newEpic = em.create(Epic, {
            reqId: await getNextReqId('G.5.', em, solution) as Epic['reqId'],
            name,
            description,
            createdBy: sessionUser,
            modifiedBy: sessionUser,
            lastModified: new Date(),
            priority,
            isSilence
        })

        em.create(Belongs, {
            left: newEpic,
            right: solution
        })

        await em.flush()

        return newEpic.id
    })

    return newId
})