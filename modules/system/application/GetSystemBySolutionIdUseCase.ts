import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type { Uuid } from "~/domain/Uuid";
import type System from "../domain/System";

export default class GetSystemBySolutionIdUseCase extends UseCase<Uuid, System | undefined> {
    constructor(readonly repository: Repository<System>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<System | undefined> {
        const system = await this.repository.getAll(g => g.solutionId === solutionId)

        return system[0]
    }
}