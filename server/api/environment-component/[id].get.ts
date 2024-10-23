import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { EnvironmentComponent } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns an environment component by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        environmentComponent = await assertReqBelongsToSolution(em, EnvironmentComponent, id, solution)

    return environmentComponent
})