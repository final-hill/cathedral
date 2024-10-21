import { e } from "@vite-pwa/assets-generator/dist/shared/assets-generator.5e51fd40.mjs"
import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Solution } from "~/server/domain/requirements/index.js"
import { Justification } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"
import slugify from "~/utils/slugify"

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string(),
    organizationId: z.string().uuid()
})

/**
 * Creates a new solution and returns its id
 */
export default defineEventHandler(async (event) => {
    const { description, name, organizationId } = await validateEventBody(event, bodySchema),
        { organization, sessionUser } = await assertOrgAdmin(event, organizationId),
        em = fork()

    const newSolution = em.create(Solution, {
        name,
        description,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence: false,
        slug: slugify(name)
    });

    em.create(Belongs, { left: newSolution, right: organization });

    ['Vision', 'Mission', 'Situation', 'Objective'].forEach(name => {
        const justification = em.create(Justification, {
            name,
            description: '',
            lastModified: new Date(),
            modifiedBy: sessionUser,
            isSilence: false
        })

        em.create(Belongs, { left: justification, right: newSolution })
    })

    await em.flush()

    return newSolution.id
})