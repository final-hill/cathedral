import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Assumption, assumptionReqIdPrefix } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

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

    const newId = await em.transactional(async (em) => {
        const newAssumption = em.create(Assumption, {
            reqId: await getNextReqId(assumptionReqIdPrefix, em, solution) as Assumption['reqId'],
            name,
            description,
            modifiedBy: sessionUser,
            lastModified: new Date(),
            isSilence
        })

        em.create(Belongs, {
            left: newAssumption,
            right: solution
        })

        await em.flush()

        return newAssumption.id
    })

    return newId
})