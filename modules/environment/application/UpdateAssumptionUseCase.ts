import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type Assumption from "../domain/Assumption"

type In = Pick<Assumption, 'id' | 'name' | 'statement'>

export default class UpdateAssumptionUseCase extends UseCase<In, void> {
    constructor(
        readonly assumptionRepository: Repository<Assumption>
    ) { super() }

    async execute({ id, name, statement }: In): Promise<void> {
        const assumption = await this.assumptionRepository.get(id)

        if (!assumption)
            throw new Error('Assumption term not found')

        Object.assign(assumption, { name, statement })

        await this.assumptionRepository.update(assumption)
    }
}