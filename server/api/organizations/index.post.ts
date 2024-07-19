import { z } from "zod"
import Organization from "~/server/domain/application/Organization"
import OrganizationRepository from "~/server/data/repositories/OrganizationRepository"
import OrganizationInteractor from "~/server/application/OrganizationInteractor"
import { getServerSession } from '#auth'

const bodySchema = z.object({
    name: z.string().min(1).max(Organization.maxNameLength),
    description: z.string().max(Organization.maxDescriptionLength)
})

/**
 * POST /api/organizations
 *
 * Creates a new organization and returns its id
 */
export default defineEventHandler(async (event) => {
    const organizationInteractor = new OrganizationInteractor(new OrganizationRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = await getServerSession(event),
        userId = session!.user!.email!

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })


    // @ts-ignore: missing slug property
    const newOrgId = organizationInteractor.create({
        name: body.data.name,
        description: body.data.description
    })

    // TODO: add the current user as an admin of the new organization

    return newOrgId
})