import { z } from "zod"
import { getServerSession } from '#auth'
import SolutionRoleRepository from "~/server/data/repositories/SolutionRoleRepository"
import SolutionRoleInteractor from "~/server/application/SolutionRoleInteractor"

const bodySchema = z.object({
    id: z.string(),
    description: z.string()
})

/**
 * POST /api/solution-roles
 *
 * Creates a new solution role and returns its id
 */
export default defineEventHandler(async (event) => {
    const solutionRoleInteractor = new SolutionRoleInteractor(new SolutionRoleRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = await getServerSession(event),
        userId = session!.user!.email!

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const newId = solutionRoleInteractor.create({
        id: body.data.id,
        description: body.data.description
    })

    return newId
})