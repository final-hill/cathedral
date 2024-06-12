import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Project from "../domain/Project";
import type { Uuid } from "~/domain/Uuid";

export default class GetProjectBySolutionIdUseCase extends UseCase<Uuid, Project | undefined> {
    constructor(readonly repository: Repository<Project>) {
        super()
    }

    async execute(solutionId: Uuid): Promise<Project | undefined> {
        const projects = await this.repository.getAll(g => g.solutionId === solutionId)

        return projects[0]
    }
}