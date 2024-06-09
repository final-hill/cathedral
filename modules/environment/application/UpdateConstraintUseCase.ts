import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type Constraint from "../domain/Constraint"

type In = Pick<Constraint, 'id' | 'name' | 'statement' | 'category'>

export default class UpdateConstraintUseCase extends UseCase<In, void> {
    constructor(
        readonly constraintRepository: Repository<Constraint>
    ) { super() }

    async execute({ id, name, statement, category }: In): Promise<void> {
        const constraint = await this.constraintRepository.get(id)

        if (!constraint)
            throw new Error('Constraint not found')

        Object.assign(constraint, { name, statement })

        await this.constraintRepository.update(constraint)
    }
}