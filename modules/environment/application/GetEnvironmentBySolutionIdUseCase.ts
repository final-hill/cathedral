import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";
import type { Uuid } from "~/domain/Uuid";

export default class GetEnvironmentBySolutionIdUseCase extends UseCase<Uuid, Environment | undefined> {
    constructor(readonly repository: Repository<Environment>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Environment | undefined> {
        const environments = await this.repository.getAll(e => e.solutionId === solutionId)

        return environments[0]
    }
}