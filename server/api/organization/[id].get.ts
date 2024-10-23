import { z } from "zod"

const paramSchema = z.object({
    id: z.string().uuid()
})

/**
 * Returns an organization by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organization } = await assertOrgReader(event, id)

    return organization
})
