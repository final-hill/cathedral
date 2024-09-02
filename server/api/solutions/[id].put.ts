import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"
import { getServerSession } from '#auth'
import AppRole from "~/server/domain/application/AppRole"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string()
})

/**
 * PUT /api/solutions/:id
 *
 * Updates a solution by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { description, name } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, id),
        em = fork()

    solution!.name = name
    solution!.description = description

    await em.flush()
})