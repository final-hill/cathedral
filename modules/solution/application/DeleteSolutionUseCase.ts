import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type Solution from "../domain/Solution";
import type { Properties } from "~/domain/Properties";
import type { Uuid } from "~/domain/Uuid";
import type Goals from "~/modules/goals/domain/Goals";

export default class DeleteSolutionUseCase extends UseCase<Uuid, void> {
    readonly goalsRepository!: Repository<Goals>
    readonly solutionRepository!: Repository<Solution>

    constructor(props: Properties<DeleteSolutionUseCase>) {
        super()

        Object.assign(this, props)
    }

    async execute(id: Uuid): Promise<void> {
        const solution = await this.solutionRepository.get(id)

        if (!solution)
            throw new Error('Solution not found')

        await this.goalsRepository.delete(solution.goalsId)
        await this.solutionRepository.delete(id)
    }
}