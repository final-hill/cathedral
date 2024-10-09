import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import slugify from "~/utils/slugify.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().default("{Untitled Organization}"),
    description: z.string().default("")
})

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description } = await validateEventBody(event, bodySchema),
        { organization } = await assertOrgContributor(event, id),
        em = fork()

    Object.assign(organization, {
        name,
        description,
        slug: slugify(name)
    })

    await em.persistAndFlush(organization)
})