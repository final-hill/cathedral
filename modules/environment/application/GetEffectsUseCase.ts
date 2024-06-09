import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type Effect from "../domain/Effect"

export default class GetEffectsUseCase extends UseCase<Uuid, Effect[]> {
    constructor(
        readonly effectRepository: Repository<Effect>
    ) { super() }

    async execute(environmentId: Uuid): Promise<Effect[]> {
        return await this.effectRepository.getAll(
            effect => effect.parentId === environmentId
        )
    }
}