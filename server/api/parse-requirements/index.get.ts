import { Collection } from "@mikro-orm/core";
import { z } from "zod";
import { fork } from "~/server/data/orm.js"
import { ParsedRequirement } from "~/server/domain/index.js";

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

    const results = (await em.findAll(ParsedRequirement, {
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
    }))
        // Remove collection items where isSilence is false
        .map(pr => {
            Object.keys(pr).forEach(key => {
                const xs = (pr as any)[key]
                if (xs instanceof Collection)
                    (pr as any)[key] = xs.filter(x => x.isSilence)
            })
            return pr
        })
        // Check if any collection property has at least one item
        .filter(pr => Object.keys(pr)
            .some(key => {
                const xs = (pr as any)[key]
                return Array.isArray(xs) && xs.length > 0
            })
        )

    return results ?? []
})