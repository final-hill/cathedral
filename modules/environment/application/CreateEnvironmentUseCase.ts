import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import Environment from "../domain/Environment";

export default class CreateEnvironmentUseCase extends UseCase<Uuid, Uuid> {
    constructor(readonly repository: Repository<Environment>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Uuid> {
        return await this.repository.add(new Environment({
            id: crypto.randomUUID(),
            solutionId,
            assumptionIds: [],
            constraintIds: [],
            effectIds: [],
            componentIds: [],
            invariantIds: [],
            limitationIds: [],
            glossaryTermIds: []
        }))
    }
}