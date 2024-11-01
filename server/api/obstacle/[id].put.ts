import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Obstacle, obstacleReqIdPrefix } from "~/domain/requirements/index.js"

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
 * Updates an obstacle by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        obstacle = await assertReqBelongsToSolution(em, Obstacle, id, solution)

    obstacle.assign({
        name: name ?? obstacle.name,
        description: description ?? obstacle.description,
        isSilence: isSilence ?? obstacle.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !obstacle.reqId)
        obstacle.reqId = await getNextReqId(obstacleReqIdPrefix, em, solution) as Obstacle['reqId']

    await em.persistAndFlush(obstacle)
})