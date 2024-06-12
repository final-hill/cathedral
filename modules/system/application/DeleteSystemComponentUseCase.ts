import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type SystemComponent from "../domain/SystemComponent"

export default class DeleteSystemComponentUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly systemComponentRepository: Repository<SystemComponent>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const systemComponentRepository = await this.systemComponentRepository.get(id)

        if (!systemComponentRepository)
            throw new Error('Component not found')

        await this.systemComponentRepository.delete(id)
    }
}