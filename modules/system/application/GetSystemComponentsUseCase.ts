import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type SystemComponent from "../domain/SystemComponent"

export default class GetSystemComponentsUseCase extends UseCase<Uuid, SystemComponent[]> {
    constructor(
        readonly componentRepository: Repository<SystemComponent>
    ) { super() }

    async execute(systemId: Uuid): Promise<SystemComponent[]> {
        return await this.componentRepository.getAll(
            component => component.systemId === systemId
        )
    }
}