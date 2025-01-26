import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application/index"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository"

const bodySchema = z.object({
    name: z.string(),
    description: z.string().default("")
})

/**
 * Creates a new organization and returns its slug
 */
export default defineEventHandler(async (event) => {
    const { name, description } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ config }),
            userId: session.id
        }),
        newOrgId = await organizationInteractor.addOrganization({ name, description })

    const newOrgInteractor = new OrganizationInteractor({
        repository: new OrganizationRepository({ config, organizationId: newOrgId }),
        userId: session.id
    })

    return newOrgInteractor.getOrganization()
})