import { z } from "zod"

const paramSchema = z.object({
    id: z.string().uuid()
})

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solution } = await assertSolutionReader(event, id)

    return solution
})
