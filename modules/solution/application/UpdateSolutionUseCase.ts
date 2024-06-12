import type Repository from "~/application/Repository";
import type Solution from "../domain/Solution";
import UseCase from "~/application/UseCase";

type In = Omit<Solution, 'equals' | 'slug'>

export default class UpdateSolutionUseCase extends UseCase<In, void> {
    constructor(readonly repository: Repository<Solution>) { super() }

    async execute(props: In): Promise<void> {
        const solution = await this.repository.get(props.id)

        if (!solution)
            throw new Error(`Solution with id ${props.id} not found`)

        Object.assign(solution, props)

        await this.repository.update(solution)
    }
}