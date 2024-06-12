import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import System from "../domain/System";

export default class CreateSystemUseCase extends UseCase<Uuid, Uuid> {
    constructor(readonly repository: Repository<System>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Uuid> {
        return await this.repository.add(new System({
            id: crypto.randomUUID(),
            solutionId,
            componentIds: [],
            limitationIds: [],
        }))
    }
}