import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationCollectionInteractor } from "~/application"
import { OrganizationCollectionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"

const paramSchema = z.object({
    slug: z.string().max(100)
})

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationCollectionInteractor({
            userId: session.id,
            repository: new OrganizationCollectionRepository({ config })
        })

    return await organizationInteractor.deleteOrganizationBySlug(slug).catch(handleDomainException)
})
