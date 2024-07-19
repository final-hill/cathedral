import { z } from "zod"
import OrganizationRepository from "~/server/data/repositories/OrganizationRepository"
import OrganizationInteractor from "~/server/application/OrganizationInteractor"
import Organization from "~/server/domain/application/Organization"
import { type Uuid } from "~/server/domain/Uuid"

const bodySchema = z.object({
    name: z.string().min(1).max(Organization.maxNameLength),
    description: z.string().min(1).max(Organization.maxDescriptionLength)
})

/**
 * Updates a solution by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        organizationInteractor = new OrganizationInteractor(new OrganizationRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        // @ts-ignore: missing slug property
        return organizationInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            description: body.data.description
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})