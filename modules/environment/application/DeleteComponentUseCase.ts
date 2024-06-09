import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Environment from "../domain/Environment"
import type Component from "~/domain/Component"

export default class DeleteComponentUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly componentRepository: Repository<Component>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const component = await this.componentRepository.get(id)

        if (!component)
            throw new Error('Component not found')

        const environment = await this.environmentRepository.get(component.parentId)

        if (!environment)
            throw new Error('Environment not found')

        environment.componentIds = environment.componentIds.filter(componentId => componentId !== id)
        await this.environmentRepository.update(environment)

        await this.componentRepository.delete(id)
    }
}