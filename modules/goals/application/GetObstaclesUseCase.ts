import UseCase from "~/application/UseCase";
import type Obstacle from "../domain/Obstacle";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";

export default class GetObstaclesUseCase extends UseCase<Uuid, Obstacle[]> {
    constructor(readonly repository: Repository<Obstacle>) {
        super()
    }

    async execute(goalsId: Uuid): Promise<Obstacle[]> {
        return await this.repository.getAll(o => o.parentId === goalsId)
    }
}