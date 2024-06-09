import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Environment from "../domain/Environment"
import type Constraint from "../domain/Constraint"

export default class DeleteConstraintUseCase extends UseCase<Uuid, void> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly constraintRepository: Repository<Constraint>
    ) { super() }

    async execute(id: Uuid): Promise<void> {
        const constraint = await this.constraintRepository.get(id)

        if (!constraint)
            throw new Error('Constraint not found')

        const environment = await this.environmentRepository.get(constraint.parentId)

        if (!environment)
            throw new Error('Environment not found')

        environment.constraintIds = environment.constraintIds.filter(constraintId => constraintId !== id)
        await this.environmentRepository.update(environment)

        await this.constraintRepository.delete(id)
    }
}