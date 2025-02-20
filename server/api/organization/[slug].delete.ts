import { z } from "zod"
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
            repository: new OrganizationCollectionRepository({ em: event.context.em })
        })

    return await organizationInteractor.deleteOrganizationBySlug(slug).catch(handleDomainException)
})
