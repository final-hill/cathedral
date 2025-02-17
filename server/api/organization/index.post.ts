import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationCollectionInteractor } from "~/application/index"
import { OrganizationCollectionRepository } from "~/server/data/repositories"
import handleDomainException from "~/server/utils/handleDomainException"

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
        organizationCollectionInteractor = new OrganizationCollectionInteractor({
            repository: new OrganizationCollectionRepository({ config }),
            userId: session.id
        })

    try {
        const newOrgId = await organizationCollectionInteractor.createOrganization({ name, description }),
            newOrg = (await organizationCollectionInteractor.findOrganizations({ id: newOrgId! }))![0]

        if (!newOrg)
            throw createError({
                status: 500,
                message: `Failed to find newly created organization for id: ${newOrgId}`
            })

        return newOrg.slug
    } catch (error: any) {
        return handleDomainException(error)
    }
})