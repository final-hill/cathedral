import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Goals from "../domain/Goals";
import Limit from "~/domain/Limit";

type In = Pick<Limit, 'parentId' | 'name' | 'statement'>

export default class CreateLimitUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly limitRepository: Repository<Limit>
    ) { super() }

    async execute(
        { parentId, name, statement }: In
    ): Promise<Uuid> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        const limitId = await this.limitRepository.add(new Limit({
            id: crypto.randomUUID(),
            parentId,
            name,
            statement,
            property: ''
        }))

        goals.limitationIds.push(limitId)

        await this.goalsRepository.update(goals)

        return limitId
    }
}