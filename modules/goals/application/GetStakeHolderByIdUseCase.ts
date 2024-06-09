import type { Uuid } from "~/domain/Uuid"
import type Stakeholder from "../domain/Stakeholder"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"

export default class GetStakeHolderByIdUseCase extends UseCase<Uuid, Stakeholder | undefined> {
    constructor(readonly repository: Repository<Stakeholder>) {
        super()
    }

    async execute(id: Uuid): Promise<Stakeholder | undefined> {
        return await this.repository.get(id)
    }
}