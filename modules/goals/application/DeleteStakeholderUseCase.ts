import UseCase from "~/application/UseCase";
import type Goals from "../domain/Goals";
import type Repository from "~/application/Repository";
import type Stakeholder from "../domain/Stakeholder";

type In = Pick<Stakeholder, 'parentId' | 'id'>

export default class DeleteStakeholderUseCase extends UseCase<In, void> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly stakeholderRepository: Repository<Stakeholder>
    ) { super() }

    async execute({ parentId, id }: In): Promise<void> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        goals.stakeholders = goals.stakeholders.filter(sid => sid !== id)

        await this.goalsRepository.update(goals)
        await this.stakeholderRepository.delete(id)
    }
}