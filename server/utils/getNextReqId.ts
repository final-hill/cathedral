import { SqlEntityManager } from "@mikro-orm/postgresql"
import { Belongs } from "~/domain/relations"
import { Requirement, Solution } from "~/domain/requirements"

/**
 * Gets the next requirement id for the given solution and requirement type
 *
 * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
 * @param em - The entity manager
 * @param solution - The owning solution of the requirement
 */
const getNextReqId = async <T extends typeof Requirement.reqIdPrefix, U extends Requirement['reqId']>(prefix: T, em: SqlEntityManager, solution: Solution): Promise<U> => {
    const entityCount = await em.count(Belongs, {
        left: {
            reqId: { $like: `${prefix}%` },
        },
        right: solution
    })

    return `${prefix}${entityCount + 1}` as U
}

export default getNextReqId