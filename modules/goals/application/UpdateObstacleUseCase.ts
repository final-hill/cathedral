import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Obstacle from "../domain/Obstacle";

type In = Pick<Obstacle, 'id' | 'name' | 'statement'>

export default class UpdateObstacleUseCase extends UseCase<In, void> {
    constructor(readonly repository: Repository<Obstacle>) {
        super();
    }

    async execute({ id, name, statement }: In): Promise<void> {
        const obstacle = await this.repository.get(id)

        if (!obstacle)
            throw new Error('Obstacle not found')

        Object.assign(obstacle, { name, statement })

        await this.repository.update(obstacle)
    }
}