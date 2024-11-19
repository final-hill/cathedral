import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application/index"

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
            entityManager: fork(),
            userId: session.id
        })

    const newOrg = await organizationInteractor.addOrganization({ name, description })

    return newOrg.slug
})