import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppRole, AppUserOrganizationRole, AppUser } from "~/domain/application/index.js"
import { Organization } from "~/domain/requirements/index.js"
import { getServerSession } from '#auth'
import slugify from "~/shared/slugify"

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

    const newOrg = em.create(Organization, {
        name,
        description,
        slug: slugify(name),
        lastModified: new Date(),
        createdBy: sessionUser,
        modifiedBy: sessionUser,
        isSilence: false
    })

    // add the current user as an admin of the new organization
    em.create(AppUserOrganizationRole, {
        appUser: sessionUser,
        organization: newOrg,
        role: AppRole.ORGANIZATION_ADMIN
    })

    await em.flush()

    return newOrg.id
})