import { z } from "zod"
import config from "~/mikro-orm.config"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application"
import { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository"

const querySchema = z.object({
    organizationSlug: z.string(),
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

/**
 * Get all unapproved requirements that follow from the specified parsed requirement
 */
export default defineEventHandler(async (event) => {
    const { solutionId, id, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            repository: new OrganizationRepository({ config, organizationSlug })
        })

    return organizationInteractor.getFollowingParsedSilenceRequirements({ solutionId, id })
})