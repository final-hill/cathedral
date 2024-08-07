import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import Solution from "~/server/domain/application/Solution"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'

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
        [body, session] = await Promise.all([
            readValidatedBody(event, (b) => bodySchema.safeParse(b)),
            getServerSession(event)
        ]),
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
    const appUserId = session?.user.id,
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUserId: appUserId, organization })

    if (!session?.user.isSystemAdmin && !appUserOrgRoles.some(r => {
        return r.role.name === 'Organization Admin'
    }))
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to create solutions for this organization'
        })

    const newSolution = new Solution({
        name: body.data.name,
        description: body.data.description,
        organization
    })

    await em.persistAndFlush(newSolution)

    return newSolution.id
})