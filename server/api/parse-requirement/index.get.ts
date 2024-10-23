import { z } from "zod";
import { fork } from "~/server/data/orm.js"
import { ParsedRequirement, ReqType } from "~/domain/requirements/index.js";

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Return all pending ParsedRequirements for a Solution.
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        { } = await assertSolutionReader(event, query.solutionId),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    return await findAllSolutionRequirements<ParsedRequirement>(ReqType.PARSED_REQUIREMENT, em, query)
})