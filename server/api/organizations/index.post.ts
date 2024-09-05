import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import AppRole from "~/server/domain/application/AppRole"
import { getServerSession } from '#auth'
import AppUser from "~/server/domain/application/AppUser"

const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string()
})

/**
 * Creates a new organization and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description } = await validateEventBody(event, bodySchema),
        session = (await getServerSession(event))!,
        em = fork()

    const sessionUser = em.getReference(AppUser, session.id)

    const newOrg = new Organization({
        name,
        description,
        solutions: []
    })

    // add the current user as an admin of the new organization
    const newAppUserOrgRole = new AppUserOrganizationRole({
        appUser: sessionUser,
        organization: newOrg,
        role: AppRole.ORGANIZATION_ADMIN
    })

    await em.persistAndFlush([newOrg, newAppUserOrgRole])

    return newOrg.id
})