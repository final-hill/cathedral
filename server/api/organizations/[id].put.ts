import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'
import slugify from "~/utils/slugify"

const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string()
})

/**
 * Updates an organization by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = (await getServerSession(event))!,
        organization = await em.findOne(Organization, id),
        sessionUserOrgRoles = await em.find(AppUserOrganizationRole, { appUserId: session.user.id, organization })

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters",
            message: JSON.stringify(body.error.errors)
        })

    if (!organization)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No organization found with id: ${id}`
        })

    // An organization can only be updated by a system admin
    // or the associated organization admin, or organization contributor
    if (session.user.isSystemAdmin || sessionUserOrgRoles.some(r => {
        return r.role.name === 'Organization Contributor' || r.role.name === 'Organization Admin'
    })) {
        organization.name = body.data.name
        organization.slug = slugify(body.data.name);
        organization.description = body.data.description

        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to update an organization."
        })
    }
})