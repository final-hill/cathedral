import { z } from "zod"
import { fork } from "~/server/data/orm"
import { EnvironmentComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

/**
 * Delete an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        em = fork()

    await assertSolutionContributor(event, solutionId)

    em.remove(em.getReference(EnvironmentComponent, id))
    await em.flush()
})