import UseCase from "~/application/UseCase";
import type Outcome from "../domain/Outcome";
import type Repository from "~/application/Repository";
import type Goals from "../domain/Goals";

type In = Pick<Outcome, 'parentId' | 'id'>

export default class DeleteOutcomeUseCase extends UseCase<In, void> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly outcomeRepository: Repository<Outcome>
    ) { super() }

    async execute({ parentId, id }: In): Promise<void> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        goals.outcomes = goals.outcomes.filter(oid => oid !== id)

        await this.goalsRepository.update(goals)
        await this.outcomeRepository.delete(id)
    }
}