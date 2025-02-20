import { z } from "zod"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"

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
            repository: new OrganizationRepository({ em: event.context.em, organizationSlug: slug }),
            userId: session.id
        })

    return await organizationInteractor.getOrganization().catch(handleDomainException)
})
