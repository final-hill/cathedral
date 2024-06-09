import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import DomainUseCase from "~/domain/UseCase"
import type { Uuid } from "~/domain/Uuid"

export default class GetUseCaseUseCase extends UseCase<Uuid, DomainUseCase[]> {
    constructor(readonly repository: Repository<DomainUseCase>) {
        super()
    }

    async execute(parentId: Uuid): Promise<DomainUseCase[]> {
        return await this.repository.getAll(s => s.parentId === parentId)
    }
}