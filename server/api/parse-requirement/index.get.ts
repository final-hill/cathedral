import { z } from "zod";
import { fork } from "~/server/data/orm.js"
import { getServerSession } from '#auth'
import { OrganizationInteractor } from "~/application";

const querySchema = z.object({
    solutionId: z.string().uuid(),
    organizationSlug: z.string()
})

/**
 * Return all ParsedRequirements for a Solution.
 */
export default defineEventHandler(async (event) => {
    const { organizationSlug, solutionId } = await validateEventQuery(event, querySchema),
        session = (await getServerSession(event))!,
        organizationInteractor = new OrganizationInteractor({
            userId: session.id,
            organizationSlug,
            entityManager: fork()
        })

    return organizationInteractor.getParsedRequirements(solutionId)
})