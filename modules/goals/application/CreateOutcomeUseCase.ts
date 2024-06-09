import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Goals from "../domain/Goals";
import Outcome from "../domain/Outcome";

type In = Pick<Outcome, 'parentId' | 'name' | 'statement'>

export default class CreateOutcomeUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly outcomeRepository: Repository<Outcome>,
    ) { super() }

    async execute(
        { parentId, name, statement }: In
    ): Promise<Uuid> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        const outcomeId = await this.outcomeRepository.add(new Outcome({
            id: crypto.randomUUID(),
            parentId,
            name,
            statement,
            property: ''
        }))

        goals.outcomes.push(outcomeId)

        await this.goalsRepository.update(goals)

        return outcomeId
    }
}