import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";
import Assumption from "../domain/Assumption";

type In = Pick<Assumption, 'parentId' | 'solutionId' | 'name' | 'statement'>

export default class CreateAssumptionUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly assumptionRepository: Repository<Assumption>
    ) { super() }

    async execute({ parentId, name, statement, solutionId }: In): Promise<Uuid> {
        const environment = await this.environmentRepository.get(parentId)

        if (!environment)
            throw new Error('Environment not found')

        const assumptionId = await this.assumptionRepository.add(new Assumption({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            solutionId,
            name,
            statement
        }))

        environment.assumptionIds.push(assumptionId)
        await this.environmentRepository.update(environment)

        return assumptionId
    }
}