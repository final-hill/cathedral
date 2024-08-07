import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"
import { getServerSession } from '#auth'

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
    const id = event.context.params?.id

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = (await getServerSession(event))!,
        solution = await em.findOne(Solution, id);

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

    const organization = await em.findOne(Organization, { id: solution!.organization.id }),
        sessionUserOrgRoles = await em.find(AppUserOrganizationRole, { appUserId: session.user.id, organization })

    // A solution can only be updated by a system admin
    // or the associated organization admin, or organization contributor

    if (session.user.isSystemAdmin || sessionUserOrgRoles.some(r => {
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