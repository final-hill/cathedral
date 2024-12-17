import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository"

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
            repository: new OrganizationRepository({ config, organizationSlug: slug })
        })

    return await organizationInteractor.deleteOrganization()
})
