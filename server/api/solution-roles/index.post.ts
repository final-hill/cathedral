import { z } from "zod"
import { getServerSession } from '#auth'
import OrganizationRoleInteractor from "~/server/application/OrganizationRoleInteractor"
import OrganizationRoleRepository from "~/server/data/repositories/OrganizationRoleRepository"

const bodySchema = z.object({
    id: z.string(),
    description: z.string()
})

/**
 * POST /api/organization-roles
 *
 * Creates a new organization role and returns its id
 */
export default defineEventHandler(async (event) => {
    const organizationRoleInteractor = new OrganizationRoleInteractor(new OrganizationRoleRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = await getServerSession(event),
        userId = session!.user!.email!

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })


    const newId = organizationRoleInteractor.create({
        id: body.data.id,
        description: body.data.description
    })

    return newId
})