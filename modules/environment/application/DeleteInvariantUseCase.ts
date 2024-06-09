import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Environment from "../domain/Environment"
import type Invariant from "../domain/Invariant"

export default class DeleteInvariantUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly invariantRepository: Repository<Invariant>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const invariant = await this.invariantRepository.get(id)

        if (!invariant)
            throw new Error('Invariant not found')

        const environment = await this.environmentRepository.get(invariant.parentId)

        if (!environment)
            throw new Error('Environment not found')

        environment.invariantIds = environment.invariantIds.filter(invariantId => invariantId !== id)
        await this.environmentRepository.update(environment)

        await this.invariantRepository.delete(id)
    }
}