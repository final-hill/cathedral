import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { Justification } from "~/server/domain/requirements/index"

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string(),
    organizationId: z.string().uuid()
})

/**
 * POST /api/solutions
 *
 * Creates a new solution and returns its id
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId } = await validateEventBody(event, bodySchema),
        { organization, sessionUser } = await assertOrgAdmin(event, organizationId),
        em = fork()

    const newSolution = new Solution({
        name,
        description,
        organization,
        assumptions: [],
        constraints: [],
        effects: [],
        environmentComponents: [],
        functionalBehaviors: [],
        glossaryTerms: [],
        invariants: [],
        justifications: [],
        limits: [],
        nonFunctionalBehaviors: [],
        obstacles: [],
        outcomes: [],
        persons: [],
        stakeholders: [],
        systemComponents: [],
        useCases: [],
        userStories: []
    })

    newSolution.justifications.add(new Justification({
        name: 'Vision',
        solution: newSolution,
        statement: '',
        lastModified: new Date(),
        modifiedBy: sessionUser
    }))
    newSolution.justifications.add(new Justification({
        name: 'Mission',
        solution: newSolution,
        statement: '',
        lastModified: new Date(),
        modifiedBy: sessionUser
    }))
    newSolution.justifications.add(new Justification({
        name: 'Situation',
        solution: newSolution,
        statement: '',
        lastModified: new Date(),
        modifiedBy: sessionUser
    }))
    newSolution.justifications.add(new Justification({
        name: 'Objective',
        solution: newSolution,
        statement: '',
        lastModified: new Date(),
        modifiedBy: sessionUser
    }))

    await em.persistAndFlush(newSolution)

    return newSolution.id
})