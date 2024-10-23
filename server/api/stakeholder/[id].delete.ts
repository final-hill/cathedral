import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Stakeholder } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete Stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        stakeholder = await assertReqBelongsToSolution(em, Stakeholder, id, solution)

    console.log('removing stakeholder', stakeholder)

    await em.removeAndFlush(stakeholder)
    console.log('stakeholder removed')
})