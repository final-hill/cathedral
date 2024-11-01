import { z } from "zod"
import { Constraint, ConstraintCategory, constraintReqIdPrefix } from "~/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.nativeEnum(ConstraintCategory).optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { category, name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        constraint = await assertReqBelongsToSolution(em, Constraint, id, solution)

    constraint.assign({
        name: name ?? constraint.name,
        description: description ?? constraint.description,
        category: category ?? constraint.category,
        isSilence: isSilence ?? constraint.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !constraint.reqId)
        constraint.reqId = await getNextReqId(constraintReqIdPrefix, em, solution) as Constraint['reqId']

    await em.persistAndFlush(constraint)
})