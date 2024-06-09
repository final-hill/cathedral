import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type Component from "~/domain/Component"

export default class GetComponentsUseCase extends UseCase<Uuid, Component[]> {
    constructor(
        readonly componentRepository: Repository<Component>
    ) { super() }

    async execute(environmentId: Uuid): Promise<Component[]> {
        return await this.componentRepository.getAll(
            component => component.parentId === environmentId
        )
    }
}