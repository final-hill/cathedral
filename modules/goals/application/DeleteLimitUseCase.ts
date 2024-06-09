import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type Goals from "../domain/Goals";
import type Limit from "~/domain/Limit";

type In = Pick<Limit, 'parentId' | 'id'>

export default class DeleteLimitUseCase extends UseCase<In, void> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly limitRepository: Repository<Limit>
    ) { super() }

    async execute({ parentId, id }: In): Promise<void> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        goals.limitationIds = goals.limitationIds.filter(lid => lid !== id)

        await this.goalsRepository.update(goals)
        await this.limitRepository.delete(id)
    }
}