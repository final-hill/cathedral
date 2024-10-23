import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { UseCase } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete UseCase by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        useCase = await assertReqBelongsToSolution(em, UseCase, id, solution)

    await em.removeAndFlush(useCase)
})