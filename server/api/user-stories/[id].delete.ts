import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { UserStory } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete User Story by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        em = fork()

    await assertSolutionContributor(event, solutionId)

    em.remove(em.getReference(UserStory, id))
    await em.flush()
})