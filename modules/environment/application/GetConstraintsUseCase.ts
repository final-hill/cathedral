import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type Constraint from "../domain/Constraint"

export default class GetConstraintsUseCase extends UseCase<Uuid, Constraint[]> {
    constructor(
        readonly constraintRepository: Repository<Constraint>
    ) { super() }

    async execute(environmentId: Uuid): Promise<Constraint[]> {
        return await this.constraintRepository.getAll(
            constraint => constraint.parentId === environmentId
        )
    }
}