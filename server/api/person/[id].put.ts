import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Person } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    email: z.string().email().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a person by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { email, name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        person = await assertReqBelongsToSolution(em, Person, id, solution)

    person.assign({
        name: name ?? person.name,
        description: description ?? person.description,
        email: email ?? person.email,
        isSilence: isSilence ?? person.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !person.reqId)
        person.reqId = await getNextReqId(Person.reqIdPrefix, em, solution) as Person['reqId']

    await em.persistAndFlush(person)
})