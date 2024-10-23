import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { SystemComponent } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete an system component by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        systemComponent = await assertReqBelongsToSolution(em, SystemComponent, id, solution)

    await em.removeAndFlush(systemComponent)
})