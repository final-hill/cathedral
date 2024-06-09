import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Environment from "../domain/Environment"
import type Assumption from "../domain/Assumption"

export default class DeleteAssumptionUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly assumptionRepository: Repository<Assumption>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const assumption = await this.assumptionRepository.get(id)

        if (!assumption)
            throw new Error('Assumption not found')

        const environment = await this.environmentRepository.get(assumption.parentId)

        if (!environment)
            throw new Error('Environment not found')

        environment.assumptionIds = environment.assumptionIds.filter(assumptionId => assumptionId !== id)
        await this.environmentRepository.update(environment)

        await this.assumptionRepository.delete(id)
    }
}