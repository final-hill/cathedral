import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import { getServerSession } from "#auth"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import AppUser from "~/server/domain/application/AppUser"
import AppRole from "~/server/domain/application/AppRole"

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
    const [body, session] = await Promise.all([
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

    const newOrg = new Organization({
        name: body.data.name,
        description: body.data.description
    })

    // add the current user as an admin of the new organization
    const newAppUserOrgRole = new AppUserOrganizationRole({
        appUser: em.getReference(AppUser, session!.id),
        organization: newOrg,
        role: (await em.findOne(AppRole, { name: 'Organization Admin' }))!
    })

    await em.persistAndFlush([newOrg, newAppUserOrgRole])

    return newOrg.id
})