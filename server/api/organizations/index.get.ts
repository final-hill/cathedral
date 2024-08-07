import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'

const querySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    slug: z.string().optional()
})

/**
 * GET /api/organizations
 *
 * Returns all organizations
 *
 * GET /api/organizations?name&description&slug
 *
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        session = (await getServerSession(event))!

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const em = fork()

    // If the user is a system admin, return all organizations
    // filtered by the query parameters
    if (session.user.isSystemAdmin) {
        const organizations = em.findAll(Organization, {
            where: {
                ...(query.data.name ? { name: query.data.name } : {}),
                ...(query.data.description ? { description: query.data.description } : {}),
                ...(query.data.slug ? { slug: query.data.slug } : {})
            }
        })

        return organizations
    }

    // If the user is not a system admin, return only organizations
    // that the user is associated with
    const organizations = (await em.findAll(AppUserOrganizationRole, {
        where: {
            appUserId: session.user.id,
            organization: {
                ...(query.data.name ? { name: query.data.name } : {}),
                ...(query.data.description ? { description: query.data.description } : {}),
                ...(query.data.slug ? { slug: query.data.slug } : {})
            }
        },
        populate: ['organization']
    })).map((aour) => aour.organization)

    return organizations
})
