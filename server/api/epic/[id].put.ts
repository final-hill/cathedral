import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Epic, MoscowPriority } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    description: z.string().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an epic by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence, priority } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        epic = await assertReqBelongsToSolution(em, Epic, id, solution)

    epic.assign({
        name: name ?? epic.name,
        isSilence: isSilence ?? epic.isSilence,
        description: description ?? epic.description,
        priority: priority ?? epic.priority,
        modifiedBy: sessionUser,
        lastModified: new Date(),
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !epic.reqId)
        epic.reqId = await getNextReqId(Epic.reqIdPrefix, em, solution) as Epic['reqId']

    await em.persistAndFlush(epic)
})