import { z } from "zod";
import { fork } from "~/server/data/orm.js"
import { ParsedRequirement, ReqType } from "~/server/domain/requirements/index.js";
import { Belongs } from "~/server/domain/relations";

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