import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Environment from "../domain/Environment"
import type Effect from "../domain/Effect"

export default class DeleteEffectUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly effectRepository: Repository<Effect>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const effect = await this.effectRepository.get(id)

        if (!effect)
            throw new Error('Effect not found')

        const environment = await this.environmentRepository.get(effect.parentId)

        if (!environment)
            throw new Error('Environment not found')

        environment.effectIds = environment.effectIds.filter(effectId => effectId !== id)
        await this.environmentRepository.update(environment)

        await this.effectRepository.delete(id)
    }
}