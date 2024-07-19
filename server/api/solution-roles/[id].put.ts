import { z } from "zod"
import OrganizationRoleInteractor from "~/server/application/OrganizationRoleInteractor"
import OrganizationRoleRepository from "~/server/data/repositories/OrganizationRoleRepository"

const bodySchema = z.object({
    id: z.string(),
    description: z.string()
})

/**
 * Updates an organization role
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        organizationRoleInteractor = new OrganizationRoleInteractor(new OrganizationRoleRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return organizationRoleInteractor.update({
            id: id,
            description: body.data.description
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})