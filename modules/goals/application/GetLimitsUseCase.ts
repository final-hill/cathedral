import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type Limit from "~/domain/Limit";

export default class GetLimitsUseCase extends UseCase<Uuid, Limit[]> {
    constructor(readonly repository: Repository<Limit>) {
        super()
    }

    async execute(goalsId: Uuid): Promise<Limit[]> {
        return await this.repository.getAll(o => o.parentId === goalsId)
    }
}