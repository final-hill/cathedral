import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"

const paramSchema = z.object({
    slug: z.string().max(100)
})

const bodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
})

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            entityManager: fork(),
            userId: session.id,
            organizationSlug: slug
        })

    return await organizationInteractor.updateOrganization(body)
})