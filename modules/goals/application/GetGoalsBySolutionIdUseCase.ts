import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Goals from "../domain/Goals";
import type { Uuid } from "~/domain/Uuid";

export default class GetGoalsBySolutionIdUseCase extends UseCase<Uuid, Goals | undefined> {
    constructor(readonly repository: Repository<Goals>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Goals | undefined> {
        const goals = await this.repository.getAll(g => g.solutionId === solutionId)

        return goals[0]
    }
}