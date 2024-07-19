import { z } from "zod"
import SolutionInteractor from "~/server/application/SolutionInteractor"
import SolutionRepository from "~/server/data/repositories/SolutionRepository"
import Solution from "~/server/domain/application/Solution"
import { type Uuid } from "~/server/domain/Uuid"

const bodySchema = z.object({
    name: z.string().min(1).max(Solution.maxNameLength),
    description: z.string().max(Solution.maxDescriptionLength),
    organizationId: z.string().uuid()
})

/**
 * POST /api/solutions
 *
 * Creates a new solution and returns its id
 */
export default defineEventHandler(async (event) => {
    const solutionInteractor = new SolutionInteractor(new SolutionRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    // @ts-ignore: missing slug property
    return solutionInteractor.create({
        name: body.data.name,
        description: body.data.description,
        organizationId: body.data.organizationId as Uuid
    })
})