import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppUserOrganizationRole } from "~/server/domain/application/index.js"
import { Organization } from "~/server/domain/requirements/index.js"
import { getServerSession } from '#auth'

const querySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    slug: z.string().optional()
})

/**
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const { description, name, slug } = await validateEventParams(event, querySchema),
        session = (await getServerSession(event))!,
        em = fork()

    // If the user is a system admin, return all organizations
    // filtered by the query parameters
    if (session.isSystemAdmin) {
        return em.findAll(Organization, {
            where: {
                ...(name ? { name } : {}),
                ...(description ? { description } : {}),
                ...(slug ? { slug } : {})
            }
        })
    }

    // If the user is not a system admin, return only organizations
    // that the user is associated with
    const organizations = (await em.findAll(AppUserOrganizationRole, {
        where: {
            appUser: session.id,
            organization: {
                ...(name ? { name } : {}),
                ...(description ? { description } : {}),
                ...(slug ? { slug } : {})
            }
        },
        populate: ['organization']
    })).map((aour) => aour.organization)

    return organizations
})
