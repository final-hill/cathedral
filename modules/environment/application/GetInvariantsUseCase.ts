import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type Invariant from "../domain/Invariant"

export default class GetInvariantsUseCase extends UseCase<Uuid, Invariant[]> {
    constructor(
        readonly invariantRepository: Repository<Invariant>
    ) { super() }

    async execute(environmentId: Uuid): Promise<Invariant[]> {
        return await this.invariantRepository.getAll(
            invariant => invariant.parentId === environmentId
        )
    }
}