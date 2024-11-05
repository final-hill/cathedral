import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { GlossaryTerm } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Glossary Term}"),
    description: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new glossary term and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence, parentComponentId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const glossaryTerm = em.create(GlossaryTerm, {
            reqId: await getNextReqId('E.1.', em, solution) as GlossaryTerm['reqId'],
            name,
            description,
            lastModified: new Date(),
            createdBy: sessionUser,
            modifiedBy: sessionUser,
            isSilence
        })

        em.create(Belongs, {
            left: glossaryTerm,
            right: solution
        })

        if (parentComponentId)
            em.create(Belongs, { left: glossaryTerm, right: parentComponentId })

        await em.flush()

        return glossaryTerm.id
    })

    return newId
})