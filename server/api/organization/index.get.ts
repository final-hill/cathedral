import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { OrganizationInteractor } from '~/application/index.js'
import { getServerSession } from '#auth'

const querySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
})

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventParams(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            entityManager: fork(),
            userId: session.id
        })

    return organizationInteractor.getUserOrganizations(query)
})
