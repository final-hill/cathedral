import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Effect } from "~/domain/requirements/index.js"

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
 * Updates an effect by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        effect = await assertReqBelongsToSolution(em, Effect, id, solution)

    effect.assign({
        name: name ?? effect.name,
        isSilence: isSilence ?? effect.isSilence,
        description: description ?? effect.description,
        modifiedBy: sessionUser,
        lastModified: new Date(),
    })

    await em.persistAndFlush(effect)
})