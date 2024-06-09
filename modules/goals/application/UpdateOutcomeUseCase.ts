import UseCase from "~/application/UseCase";
import type Outcome from "../domain/Outcome";
import type Repository from "~/application/Repository";

type In = Pick<Outcome, 'id' | 'name' | 'statement'>

export default class UpdateOutcomeUseCase extends UseCase<In, void> {
    constructor(
        readonly repository: Repository<Outcome>
    ) { super() }

    async execute(
        { id, name, statement }: In
    ): Promise<void> {
        const outcome = await this.repository.get(id)

        if (!outcome)
            throw new Error('Outcome not found')

        Object.assign(outcome, { name, statement })

        await this.repository.update(outcome)
    }
}