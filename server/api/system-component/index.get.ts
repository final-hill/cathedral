import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/server/domain/relations"
import { ReqType, SystemComponent } from "~/server/domain/requirements/index.js"
import { type ReqRelModel } from "~/server/domain/types"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    parentComponent: z.string().uuid().optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all system-components that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    const sysComponents = await findAllSolutionRequirements<SystemComponent>(ReqType.SYSTEM_COMPONENT, em, query),
        parentComponents = await em.find(Belongs, {
            left: sysComponents,
            right: {
                req_type: ReqType.SYSTEM_COMPONENT,
                ...(query.parentComponent ? { id: query.parentComponent } : {})
            }
        }, { populate: ['right'] }),
        joinedComponents = sysComponents.map(sysComp => {
            const parent = parentComponents.find(pc => pc.left.id === sysComp.id)
            return {
                ...sysComp,
                solutionId: query.solutionId,
                parentComponent: parent?.right
            }
        }) as unknown as ReqRelModel<SystemComponent>[]

    return joinedComponents
})