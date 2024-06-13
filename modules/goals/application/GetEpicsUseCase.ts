import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import type { Uuid } from "~/domain/Uuid"
import type Epic from "../domain/Epic"

export default class GetEpicsUseCase extends UseCase<Uuid, Epic[]> {
    constructor(readonly repository: Repository<Epic>) {
        super()
    }

    async execute(parentId: Uuid): Promise<Epic[]> {
        return await this.repository.getAll(s => s.parentId === parentId)
    }
}