import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type Goals from "../domain/Goals";
import Goal from "../domain/Goal";

type In = Pick<Goal, 'parentId' | 'statement'>

export default class CreateMissionUseCase extends UseCase<In, void> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly goalRepository: Repository<Goal>
    ) { super() }

    async execute({ parentId, statement }: In): Promise<void> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        const missionId = await this.goalRepository.add(new Goal({
            id: crypto.randomUUID(),
            parentId: parentId,
            name: 'Mission',
            statement,
            property: ''
        }))

        goals.goals.push(missionId)

        await this.goalsRepository.update(goals)
    }
}