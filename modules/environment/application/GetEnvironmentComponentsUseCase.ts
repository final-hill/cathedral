import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type EnvironmentComponent from "../domain/EnvironmentComponent"

export default class GetEnvironmentComponentsUseCase extends UseCase<Uuid, EnvironmentComponent[]> {
    constructor(
        readonly componentRepository: Repository<EnvironmentComponent>
    ) { super() }

    async execute(parentId: Uuid): Promise<EnvironmentComponent[]> {
        return await this.componentRepository.getAll(
            component => component.parentId === parentId
        )
    }
}