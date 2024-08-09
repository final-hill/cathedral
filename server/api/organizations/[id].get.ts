import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'

/**
 * Returns an organization by id
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
        session = (await getServerSession(event))!,
        organization = await em.findOne(Organization, id),
        sessionUserOrgRoleCount = await em.count(AppUserOrganizationRole, { appUser: session.id, organization })

    // check if the user is a member of the organization or a system admin before returning it
    const result = session.isSystemAdmin || sessionUserOrgRoleCount ? organization : null

    if (!result)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a member of the organization or a system admin to view it."
        })

    return result
})
