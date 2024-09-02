import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Collection } from "@mikro-orm/core";
import assertSolutionAdmin from "~/server/utils/assertSolutionAdmin";

const paramSchema = z.object({
    id: z.string().uuid()
})

/**
 * Delete a solution by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solution } = await assertSolutionAdmin(event, id),
        em = fork()

    // for each property of the solution that is a collection, remove all items
    for (const key in solution) {
        const maybeCollection = Reflect.get(solution, key) as Collection<any>
        if (maybeCollection instanceof Collection)
            maybeCollection.removeAll()
    }
    await em.flush()
    await em.removeAndFlush(solution)
})
