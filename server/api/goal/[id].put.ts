import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Goal } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a Goal by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        { name, description, isSilence } = await validateEventBody(event, bodySchema),
        em = fork(),
        goal = await assertReqBelongsToSolution(em, Goal, id, solution)

    goal.assign({
        name: name ?? goal.name,
        description: description ?? goal.description,
        isSilence: isSilence ?? goal.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(goal)
})