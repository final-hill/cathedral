import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"

const querySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * Returns an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(query.error.errors)
        })
    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        appUserRole = await em.findOne(AppUserOrganizationRole, {
            appUser: id,
            organization: query.data.organizationId
        }, { populate: ['appUser'] })

    if (!appUserRole)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "AppUser not found for the given ID and organization."
        })

    return {
        ...appUserRole.appUser.toJSON(),
        role: appUserRole.role
    }
})
