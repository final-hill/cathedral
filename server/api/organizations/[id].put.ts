import { z } from "zod"
import { fork } from "~/server/data/orm"
import slugify from "~/utils/slugify"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string()
})

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description } = await validateEventBody(event, bodySchema),
        { organization } = await assertOrgContributor(event, id),
        em = fork()

    organization.name = name
    organization.slug = slugify(name);
    organization.description = description

    await em.flush()
})