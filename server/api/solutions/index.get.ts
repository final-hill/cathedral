import { fork } from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/application/Solution"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"

const querySchema = z.object({
    name: z.string().max(100).optional(),
    description: z.string().optional(),
    organizationId: z.string().uuid().optional(),
    organizationSlug: z.string().max(100).optional(),
    slug: z.string().max(100).optional()
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

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
    const config = useRuntimeConfig(),
        [query, session] = await Promise.all([
            getValidatedQuery(event, (q) => querySchema.safeParse(q)),
            useSession(event, { password: config.sessionPassword })
        ])

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const em = fork(),
        appUser = (await em.findOne(AppUser, { id: session.id }))!;

    const organization = await em.findOne(Organization, {
        ...(query.data.organizationId ? { id: query.data.organizationId } : {}),
        ...(query.data.organizationSlug ? { slug: query.data.organizationSlug } : {}),
    })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Organization not found"
        })

    // If the user is a system admin, return all solutions
    // filtered by the query parameters
    const allOrgSolutions = await em.findAll(Solution, {
        where: {
            ...{ organization },
            ...(query.data.name ? { name: query.data.name } : {}),
            ...(query.data.description ? { description: query.data.description } : {}),
            ...(query.data.slug ? { slug: query.data.slug } : {}),
        }
    })

    if (allOrgSolutions.length === 0)
        return []

    if (appUser.isSystemAdmin)
        return allOrgSolutions

    // If the user is not a system admin, return only solutions
    // that the user is associated with
    const appUserOrgs = await em.findAll(AppUserOrganizationRole, {
        where: {
            appUser: appUser.id,
            organization
        },
    })

    if (appUserOrgs.length === 0)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You do not have access to this organization"
        })

    return allOrgSolutions.filter((sol) => appUserOrgs.some((aou) => aou.organization === sol.organization))
})