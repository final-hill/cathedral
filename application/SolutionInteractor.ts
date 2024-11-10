import { Requirement, type Solution } from "~/domain/requirements";
import Interactor from "./Interactor";
import { Belongs } from "~/domain/relations";

export default class SolutionInteractor extends Interactor<Solution> {
    /**
     * Gets the next requirement id for the given solution and requirement type
     *
     * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
     * @param solution - The owning solution of the requirement
     */
    async getNextReqId<R extends typeof Requirement>(prefix: R['reqIdPrefix'], solution: Solution): Promise<InstanceType<R>['reqId']> {
        const entityCount = await this.repository.getEntityManager().count(Belongs, {
            left: { reqId: { $like: `${prefix}%` } },
            right: solution
        })

        return `${prefix}${entityCount + 1}`
    }


    async addRequirement(solutionId: Solution['id'], requirement: Requirement): Promise<void> {
        const solution = await this.repository.findOneOrFail(solutionId),
            em = this.repository.getEntityManager()

        em.create(Belongs, {
            left: requirement,
            right: solution
        })

        await em.flush()
    }
}