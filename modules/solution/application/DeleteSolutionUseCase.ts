import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Solution from "../domain/Solution";

export default class DeleteSolutionUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly solutionRepository: Repository<Solution>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const solution = await this.solutionRepository.get(id)

        if (!solution)
            throw new Error('Solution not found')

        await this.solutionRepository.delete(id)
    }
}