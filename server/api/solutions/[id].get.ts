import { fork } from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/application/Solution"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'

const paramSchema = z.object({
    id: z.string().uuid()
})

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solution } = await assertSolutionReader(event, id)

    return solution
})
