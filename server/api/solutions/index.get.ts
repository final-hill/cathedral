import { fork } from "~/server/data/orm"
import { getServerSession } from "#auth"
import { z } from "zod"
import Solution from "~/server/domain/application/Solution"
import AppUser from "~/server/domain/application/AppUser"

const querySchema = z.object({
    name: z.string().max(100).optional(),
    description: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    slug: z.string().max(100).optional()
})

/**
 * GET /api/solutions
 *
 * Returns all solutions
 *
 * GET /api/solutions?name&description&slug&organizationId
 *
 * Returns all solutions that match the query parameters
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
        appUser = (await em.findOne(AppUser, { id: session!.id }))!;

    // If the user is a system admin, return all solutions
    // filtered by the query parameters
    if (appUser.isSystemAdmin) {
        let allSolutions = em.createQueryBuilder(Solution)
            .select('*')

        if (query.data.name)
            allSolutions = allSolutions.andWhere('name = ?', [query.data.name])
        if (query.data.description)
            allSolutions = allSolutions.andWhere('description = ?', [query.data.description])
        if (query.data.slug)
            allSolutions = allSolutions.andWhere('slug = ?', [query.data.slug])
        if (query.data.organizationId)
            allSolutions = allSolutions.andWhere('organization_id = ?', [query.data.organizationId])

        return allSolutions.execute('all')
    }

    // If the user is not a system admin, return only organizations
    // that the user is associated with
    let appUserOrgs = em.createQueryBuilder(Solution)
        .select('*')
        .leftJoin('app_user_organization_role', 'aour')
        .where('aour.organization_id = solution.organization_id')
        .andWhere('aour.app_user_id = ?', [appUser.id])

    if (query.data.name)
        appUserOrgs = appUserOrgs.andWhere('name = ?', [query.data.name])
    if (query.data.description)
        appUserOrgs = appUserOrgs.andWhere('description = ?', [query.data.description])
    if (query.data.slug)
        appUserOrgs = appUserOrgs.andWhere('slug = ?', [query.data.slug])
    if (query.data.organizationId)
        appUserOrgs = appUserOrgs.andWhere('organization_id = ?', [query.data.organizationId])

    return appUserOrgs.execute('all')
})
