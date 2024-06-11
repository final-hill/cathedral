import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import { type Uuid, emptyUuid } from "~/domain/Uuid";
import Solution from "../domain/Solution";

type In = { name: string, description: string }

export default class CreateSolutionUseCase extends UseCase<In, Uuid> {
    constructor(readonly repository: Repository<Solution>) { super() }

    async execute({ name, description }: In): Promise<Uuid> {
        const solution = new Solution({
            id: crypto.randomUUID(),
            name,
            description,
            environmentId: emptyUuid,
            goalsId: emptyUuid,
            projectId: emptyUuid,
            systemId: emptyUuid
        })

        await this.repository.add(solution)

        return solution.id
    }
}