import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Obstacle, Solution, Outcome } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"
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

    [[Outcome, 'G.1'] as const, [Obstacle, 'G.2'] as const].forEach(([Entity, name]) => {
        const entity = em.create(Entity, {
            reqId: `${name}.1` as any,
            name,
            description: '',
            lastModified: new Date(),
            modifiedBy: sessionUser,
            isSilence: false
        })

        em.create(Belongs, {
            left: entity,
            right: newSolution
        })
    })

    await em.flush()

    return newSolution.id
})