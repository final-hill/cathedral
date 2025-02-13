import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories"
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
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ config, organizationSlug: slug }),
            userId: session.id
        })

    return await organizationInteractor.updateOrganization(body).catch(handleDomainException)
})