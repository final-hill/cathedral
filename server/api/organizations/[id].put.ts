import { z } from "zod"
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import { getServerSession } from "#auth"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import slugify from "~/lib/slugify"

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
        [body, session] = await Promise.all([
            readValidatedBody(event, (b) => bodySchema.safeParse(b)),
            getServerSession(event)
        ]),
        organization = await em.findOne(Organization, id),
        appUser = (await em.findOne(AppUser, { id: session!.id }))!,
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser, organization })

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
    if (appUser.isSystemAdmin || appUserOrgRoles.some(r => {
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