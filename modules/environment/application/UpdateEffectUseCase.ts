import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type Effect from "../domain/Effect"

type In = Pick<Effect, 'id' | 'name' | 'statement'>

export default class UpdateEffectUseCase extends UseCase<In, void> {
    constructor(
        readonly effectRepository: Repository<Effect>
    ) { super() }

    async execute({ id, name, statement }: In): Promise<void> {
        const effect = await this.effectRepository.get(id)

        if (!effect)
            throw new Error('Effect term not found')

        Object.assign(effect, { name, statement })

        await this.effectRepository.update(effect)
    }
}