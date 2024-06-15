import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";
import Constraint from "../domain/Constraint";

type In = Pick<Constraint, 'parentId' | 'solutionId' | 'name' | 'statement' | 'category'>

export default class CreateConstraintUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly constraintRepository: Repository<Constraint>
    ) { super() }

    async execute({ parentId, solutionId, name, statement, category }: In): Promise<Uuid> {
        const environment = await this.environmentRepository.get(parentId)

        if (!environment)
            throw new Error('Environment not found')

        const constraintId = await this.constraintRepository.add(new Constraint({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            solutionId,
            name,
            statement,
            category
        }))

        environment.constraintIds.push(constraintId)
        await this.environmentRepository.update(environment)

        return constraintId
    }
}