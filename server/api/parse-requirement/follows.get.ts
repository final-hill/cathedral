import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { ParsedRequirement, Requirement } from "~/domain/requirements/index.js"
import { Follows } from "~/domain/relations/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

/**
 * Get all unapproved requirements that follow from the specified parsed requirement
 */
export default defineEventHandler(async (event) => {
    const { solutionId, id } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        parsedRequirement = await assertReqBelongsToSolution(em, ParsedRequirement, id, solution),
        follows = await em.find(Follows, {
            right: parsedRequirement,
            left: { isSilence: true }
        }, { populate: ['left'] })

    const groupedResult = groupBy(
        follows.map(f => f.left) as Requirement[],
        ({ req_type }) => req_type
    )

    return groupedResult
})