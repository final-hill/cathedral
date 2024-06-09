import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type Goals from "../domain/Goals";
import type Obstacle from "../domain/Obstacle";

type In = Pick<Obstacle, 'parentId' | 'id'>

export default class DeleteObstacleUseCase extends UseCase<In, void> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly obstacleRepository: Repository<Obstacle>
    ) { super() }

    async execute({ parentId, id }: In): Promise<void> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        goals.obstacles = goals.obstacles.filter(uid => uid !== id)

        await this.goalsRepository.update(goals)
        await this.obstacleRepository.delete(id)
    }
}