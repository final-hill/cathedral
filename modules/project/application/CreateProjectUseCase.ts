import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import Project from "../domain/Project";

export default class CreateProjectUseCase extends UseCase<Uuid, Uuid> {
    constructor(readonly repository: Repository<Project>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Uuid> {
        return await this.repository.add(new Project({
            id: crypto.randomUUID(),
            solutionId,
            componentIds: [],
            limitationIds: []
        }))
    }
}