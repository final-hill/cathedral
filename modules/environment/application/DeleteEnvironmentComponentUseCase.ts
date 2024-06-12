import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type PEGS from "~/domain/PEGS"
import type EnvironmentComponent from "../domain/EnvironmentComponent"

export default class DeleteEnvironmentComponentUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly pegsRepository: Repository<PEGS>,
        readonly environmentComponentRepository: Repository<EnvironmentComponent>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const environmentComponent = await this.environmentComponentRepository.get(id)

        if (!environmentComponent)
            throw new Error('Component not found')

        const pegs = await this.pegsRepository.get(environmentComponent.parentId)

        if (!pegs)
            throw new Error('Parent not found')

        pegs.componentIds = pegs.componentIds.filter(componentId => componentId !== id)
        await this.pegsRepository.update(pegs)

        await this.environmentComponentRepository.delete(id)
    }
}