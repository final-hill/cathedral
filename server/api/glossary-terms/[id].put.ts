import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { GlossaryTerm } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        glossaryTerm = await assertReqBelongsToSolution(em, GlossaryTerm, id, solution)

    glossaryTerm.assign({
        name: name ?? glossaryTerm.name,
        description: description ?? glossaryTerm.description,
        isSilence: isSilence ?? glossaryTerm.isSilence,
        // TODO: future use as part of Topic Maps? make sure the parentComponent belongs to the same solution
        // parentComponent: undefined,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.flush()
})