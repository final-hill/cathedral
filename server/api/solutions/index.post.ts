import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import Solution from "~/server/domain/application/Solution"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'
import AppRole from "~/server/domain/application/AppRole"
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
    const config = useRuntimeConfig(),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = (await getServerSession(event))!,
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const organization = await em.findOne(Organization, { id: body.data.organizationId })

    if (!organization)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No organization found with id: ${body.data.organizationId}`
        })

    // Only System Admins and Organization Admins can create solutions
    // An Organization Admin can only create solutions for their organization
    const appUserId = session.id,
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser: appUserId, organization })

    if (!session.isSystemAdmin && !appUserOrgRoles.some(r => {
        return r.role === AppRole.ORGANIZATION_ADMIN
    }))
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to create solutions for this organization'
        })

    const newSolution = new Solution({
        name: body.data.name,
        description: body.data.description,
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
        statement: ''
    }))
    newSolution.justifications.add(new Justification({
        name: 'Mission',
        solution: newSolution,
        statement: ''
    }))
    newSolution.justifications.add(new Justification({
        name: 'Situation',
        solution: newSolution,
        statement: ''
    }))
    newSolution.justifications.add(new Justification({
        name: 'Objective',
        solution: newSolution,
        statement: ''
    }))

    await em.persistAndFlush(newSolution)

    return newSolution.id
})