import { SqlEntityManager } from "@mikro-orm/postgresql"
import { Belongs } from "~/domain/relations"
import { Requirement, Solution } from "~/domain/requirements/index.js"

/**
 * Delete a requirement associated with a solution and decrement the numbers of subsequent requirements
 *
 * @param em - The entity manager
 * @param entity - The requirement to delete
 * @param solution - The solution to delete the requirement from
 */
const deleteSolutionRequirement = async (em: SqlEntityManager, entity: Requirement, solution: Solution) => {
    return em.transactional(async (em) => {
        if (!entity.reqId)
            return await em.removeAndFlush(entity)

        const reReqId = /^([PEGS]\.\d+\.)(\d+)$/,
            [, prefixMatch, numMatch] = entity.reqId.match(reReqId)!

        // Find all reqIds with the same prefix and a higher number than the deleted one
        const rowsToUpdate = (await em.find(Belongs, {
            left: {
                reqId: { $like: `${prefixMatch}%` }
            },
            right: solution
        }, { populate: ['left'] })).filter(({ left }) => {
            const [, , num] = left.reqId!.match(reReqId)!
            return parseInt(num) > parseInt(numMatch)
        }).map(({ left }) => left)

        em.remove(entity)

        // Decrement the number part of each subsequent reqId
        for (const row of rowsToUpdate) {
            const [, prefix, num] = row.reqId!.match(reReqId)!
            row.reqId = `${prefix}${parseInt(num) - 1}` as Requirement['reqId']
            em.persist(row)
        }

        await em.flush()
    })
}

export default deleteSolutionRequirement