import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Obstacle } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Obstacle}"),
    statement: z.string().default(""),
    isSilence: z.boolean().optional()
})

/**
 * Updates an obstacle by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        obstacle = await em.findOne(Obstacle, id)

    if (!obstacle)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    Object.assign(obstacle, {
        name,
        statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    await em.flush()
})