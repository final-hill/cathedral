import { z } from "zod"
import { fork } from "~/server/data/orm"
import { getServerSession } from "#auth"
import Organization from "~/server/domain/application/Organization"
import AppUser from "~/server/domain/application/AppUser"

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
    const [query, session] = await Promise.all([
        getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        getServerSession(event)
    ])

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const em = fork(),
        sessionUser = (await em.findOne(AppUser, { id: session!.id }))!;

    // If the user is a system admin, return all organizations
    // filtered by the query parameters
    if (sessionUser.isSystemAdmin) {
        let allOrgs = em.createQueryBuilder(Organization)
            .select('*')

        if (query.data.name)
            allOrgs = allOrgs.andWhere('name = ?', [query.data.name])
        if (query.data.description)
            allOrgs = allOrgs.andWhere('description = ?', [query.data.description])
        if (query.data.slug)
            allOrgs = allOrgs.andWhere('slug = ?', [query.data.slug])

        return allOrgs.execute('all')
    }

    // If the user is not a system admin, return only organizations
    // that the user is associated with
    let appUserOrgs = em.createQueryBuilder(Organization)
        .select('*')
        .leftJoin('app_user_organization_role', 'aour')
        .where('aour.organization_id = id')
        .andWhere('aour.app_user_id = ?', [sessionUser.id])

    if (query.data.name)
        appUserOrgs = appUserOrgs.andWhere('name = ?', [query.data.name])
    if (query.data.description)
        appUserOrgs = appUserOrgs.andWhere('description = ?', [query.data.description])
    if (query.data.slug)
        appUserOrgs = appUserOrgs.andWhere('slug = ?', [query.data.slug])

    return appUserOrgs.execute('all')
})
