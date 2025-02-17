import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationCollectionInteractor } from "~/application"
import { OrganizationCollectionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"

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
        organizationInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ config }),
            userId: session.id
        })

    return await organizationInteractor.updateOrganizationBySlug(slug, body).catch(handleDomainException)
})