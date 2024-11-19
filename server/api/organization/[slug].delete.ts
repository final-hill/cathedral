import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"

const paramSchema = z.object({
    slug: z.string().max(100)
})

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            entityManager: fork(),
            organizationSlug: slug
        })

    return await organizationInteractor.deleteOrganization()
})
