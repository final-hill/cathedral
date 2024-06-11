import type Repository from "~/application/Repository";
import type Solution from "../domain/Solution";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";

type In = { id: Uuid, name: string, description: string }

export default class UpdateSolutionUseCase extends UseCase<In, void> {
    constructor(readonly repository: Repository<Solution>) { super() }

    async execute({ id, name, description }: In): Promise<void> {
        const solution = await this.repository.get(id)

        if (!solution)
            throw new Error(`Solution with id ${id} not found`)

        Object.assign(solution, { name, description })

        await this.repository.update(solution)
    }
}