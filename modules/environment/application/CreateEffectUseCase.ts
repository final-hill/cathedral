import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";
import Effect from "../domain/Effect";

type In = Pick<Effect, 'parentId' | 'name' | 'statement'>

export default class CreateEffectUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly effectRepository: Repository<Effect>
    ) { super() }

    async execute({ parentId, name, statement }: In): Promise<Uuid> {
        const environment = await this.environmentRepository.get(parentId)

        if (!environment)
            throw new Error('Environment not found')

        const effectId = await this.effectRepository.add(new Effect({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            name,
            statement
        }))

        environment.effectIds.push(effectId)
        await this.environmentRepository.update(environment)

        return effectId
    }
}