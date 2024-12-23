import { z } from "zod"
import config from "~/mikro-orm.config"
import { OrganizationInteractor } from '~/application/index.js'
import { getServerSession } from '#auth'
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository"

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
            repository: new OrganizationRepository({ config }),
            userId: session.id
        })

    return organizationInteractor.getAppUserOrganizations(query)
})
