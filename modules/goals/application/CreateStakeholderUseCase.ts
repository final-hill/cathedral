import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import Stakeholder from "../domain/Stakeholder";
import type Repository from "~/application/Repository";
import type Goals from "../domain/Goals";

type In = Pick<Stakeholder, 'parentId' | 'name' | 'statement' | 'availability' | 'influence' | 'segmentation'>

export default class CreateStakeholderUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly stakeholderRepository: Repository<Stakeholder>
    ) { super() }

    async execute({ parentId, ...props }: In): Promise<Uuid> {
        let goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        const stakeholderId = await this.stakeholderRepository.add(
            new Stakeholder({
                id: crypto.randomUUID(),
                parentId,
                name: props.name,
                statement: props.statement,
                availability: props.availability,
                influence: props.influence,
                segmentation: props.segmentation,
                property: ''
            })
        )

        goals.stakeholders.push(stakeholderId)

        await this.goalsRepository.update(goals)

        return stakeholderId
    }
}