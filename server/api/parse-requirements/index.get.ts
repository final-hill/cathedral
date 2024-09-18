import { z } from "zod";
import { fork } from "~/server/data/orm"
import { ParsedRequirements } from "~/server/domain/application";

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Return all pending ParsedRequirements for a Solution.
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork()

    const results = await em.find(ParsedRequirements, { solution });

    return results ?? []
})