import type { Uuid } from "~/domain/Uuid"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type Assumption from "../domain/Assumption"

export default class GetAssumptionsUseCase extends UseCase<Uuid, Assumption[]> {
    constructor(
        readonly assumptionRepository: Repository<Assumption>
    ) { super() }

    async execute(environmentId: Uuid): Promise<Assumption[]> {
        return await this.assumptionRepository.getAll(
            assumption => assumption.parentId === environmentId
        )
    }
}