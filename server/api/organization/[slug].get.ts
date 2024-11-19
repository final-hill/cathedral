import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"

const paramSchema = z.object({
    slug: z.string().max(100)
})

/**
 * Returns an organization by slug
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            entityManager: fork(),
            userId: session.id,
            organizationSlug: slug
        })

    return await organizationInteractor.getOrganization()
})
