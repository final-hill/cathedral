import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import AppRole from "~/server/domain/application/AppRole"
import { getServerSession } from '#auth'

const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string()
})

/**
 * POST /api/organizations
 *
 * Creates a new organization and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = (await getServerSession(event))!,
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const newOrg = new Organization({
        name: body.data.name,
        description: body.data.description
    })

    console.log('Session', session)

    // add the current user as an admin of the new organization
    const newAppUserOrgRole = new AppUserOrganizationRole({
        appUserId: session.user.id,
        organization: newOrg,
        role: (await em.findOne(AppRole, { name: 'Organization Admin' }))!
    })

    await em.persistAndFlush([newOrg, newAppUserOrgRole])

    return newOrg.id
})