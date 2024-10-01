import { z } from "zod";
import { fork } from "~/server/data/orm"
import { ParsedRequirement } from "~/server/domain/requirements";

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

    const results = await em.findAll(ParsedRequirement, {
        where: {
            solution,
            name: '{LLM Parsed Requirement}'
        },
        populate: [
            'modifiedBy', 'assumptions', 'constraints',
            'effects', 'environmentComponents', 'functionalBehaviors',
            'glossaryTerms', 'invariants', 'justifications', 'limits',
            'nonFunctionalBehaviors', 'obstacles', 'outcomes', 'persons',
            'stakeholders', 'systemComponents', 'useCases', 'userStories'
        ]
    });

    return results ?? []
})