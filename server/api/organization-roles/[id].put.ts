import { z } from "zod"
import SolutionRoleInteractor from "~/server/application/SolutionRoleInteractor"
import SolutionRoleRepository from "~/server/data/repositories/SolutionRoleRepository"

const bodySchema = z.object({
    id: z.string(),
    description: z.string()
})

/**
 * Updates a solution role
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        solutionRoleInteractor = new SolutionRoleInteractor(new SolutionRoleRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return solutionRoleInteractor.update({
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