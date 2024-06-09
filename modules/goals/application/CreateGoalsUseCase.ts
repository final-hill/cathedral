import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import Goals from "../domain/Goals";

export default class CreateGoalsUseCase extends UseCase<Uuid, Uuid> {
    constructor(readonly repository: Repository<Goals>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Uuid> {
        return await this.repository.add(new Goals({
            id: crypto.randomUUID(),
            solutionId,
            goals: [],
            componentIds: [],
            limitationIds: [],
            obstacles: [],
            outcomes: [],
            stakeholders: [],
            useCases: [],
        }))
    }
}