import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Limit from "~/domain/Limit";

type In = Pick<Limit, 'id' | 'name' | 'statement'>

export default class UpdateLimitUseCase extends UseCase<In, void> {
    constructor(readonly repository: Repository<Limit>) {
        super();
    }

    async execute({ id, name, statement }: In): Promise<void> {
        const goalsLimit = await this.repository.get(id)

        if (!goalsLimit)
            throw new Error('GoalsLimit not found')

        Object.assign(goalsLimit, { name, statement })

        await this.repository.update(goalsLimit)
    }
}