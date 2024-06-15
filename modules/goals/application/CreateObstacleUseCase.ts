import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Goals from "../domain/Goals";
import Obstacle from "../domain/Obstacle";

type In = Pick<Obstacle, 'parentId' | 'solutionId' | 'name' | 'statement'>

export default class CreateObstacleUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly obstacleRepository: Repository<Obstacle>
    ) { super() }

    async execute(
        { parentId, solutionId, name, statement }: In
    ): Promise<Uuid> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        const obstacleId = await this.obstacleRepository.add(new Obstacle({
            id: crypto.randomUUID(),
            parentId,
            solutionId,
            name,
            statement,
            property: ''
        }))

        goals.obstacles.push(obstacleId)

        await this.goalsRepository.update(goals)

        return obstacleId
    }
}