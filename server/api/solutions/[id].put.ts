import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string()
})

/**
 * PUT /api/solutions/:id
 *
 * Updates a solution by id.
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        id = event.context.params?.id

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        [body, session, solution] = await Promise.all([
            readValidatedBody(event, (b) => bodySchema.safeParse(b)),
            useSession(event, { password: config.sessionPassword }),
            em.findOne(Solution, id),
        ])

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No solution found with id: ${id}`
        })
    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const [appUser, organization] = await Promise.all([
        em.findOne(AppUser, { id: session.id }),
        em.findOne(Organization, { id: solution!.organization.id })
    ]),
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser, organization })

    // A solution can only be updated by a system admin
    // or the associated organization admin, or organization contributor

    if (appUser!.isSystemAdmin || appUserOrgRoles.some(r => {
        return r.role.name === 'Organization Contributor' || r.role.name === 'Organization Admin'
    })) {
        solution!.name = body.data.name
        solution!.description = body.data.description

        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin, an organization admin," +
                " or an organization contributor to update a solution."
        })
    }

})