import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Assumption, Solution } from "~/domain/requirements/index.js"
import AssumptionInteractor from "~/application/AssumptionInteractor"
import { Belongs } from "~/domain/relations"
import SolutionInteractor from "~/application/SolutionInteractor"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Assumption}"),
    description: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new assumption and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        assumptionInteractor = new AssumptionInteractor({ repository: em.getRepository(Assumption) }),
        solutionInteractor = new SolutionInteractor({ repository: em.getRepository(Solution) })

    const newAssumption = await assumptionInteractor.createAssumption({
        name,
        description,
        createdBy: sessionUser,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence,
        reqId: await solutionInteractor.getNextReqId<typeof Assumption>(Assumption.reqIdPrefix, solution)
    })

    await solutionInteractor.addRequirement(solutionId, newAssumption)

    return newAssumption.id
})