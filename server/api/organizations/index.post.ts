import { z } from "zod"
import { fork } from "~/server/data/orm"
import { AppRole, AppUserOrganizationRole, AppUser, Organization } from "~/server/domain/application/index"
import { getServerSession } from '#auth'

const bodySchema = z.object({
    name: z.string().default("{Untitled Organization}"),
    description: z.string().default("")
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