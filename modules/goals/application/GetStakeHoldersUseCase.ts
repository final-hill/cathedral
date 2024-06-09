import type { Uuid } from "~/domain/Uuid"
import type Stakeholder from "../domain/Stakeholder"
import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"

export default class GetStakeHoldersUseCase extends UseCase<Uuid, Stakeholder[]> {
    constructor(readonly repository: Repository<Stakeholder>) {
        super()
    }

    async execute(goalsId: Uuid): Promise<Stakeholder[]> {
        return await this.repository.getAll(s => s.parentId === goalsId)
    }
}