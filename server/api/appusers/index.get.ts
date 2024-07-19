import { z } from "zod"
import AppUserInteractor from "~/server/application/AppUserInteractor"
import AppUserRepository from "~/server/data/repositories/AppUserRepository"

const querySchema = z.object({
    defaultOrganizationId: z.string().uuid().optional(),
    creationDate: z.date().optional()
})

/**
 * GET /api/appusers
 *
 * Returns all appusers
 *
 * GET /api/appusers?defaultOrganizationId
 *
 * Returns all appusers that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const appUserInteractor = new AppUserInteractor(new AppUserRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return appUserInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
