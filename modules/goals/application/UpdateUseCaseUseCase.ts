import UseCase from "~/application/UseCase";
import DomainUseCase from "~/domain/UseCase";
import type Repository from "~/application/Repository";

type In = Pick<DomainUseCase, 'id' | 'name' | 'primaryActorId' | 'statement'>;

export default class UpdateOutcomeUseCase extends UseCase<In, void> {
    constructor(
        readonly useCaseRepository: Repository<DomainUseCase>
    ) { super() }

    async execute(
        { id, primaryActorId, name, statement }: In
    ): Promise<void> {
        const useCase = await this.useCaseRepository.get(id)

        if (!useCase)
            throw new Error('UseCase not found')

        Object.assign(useCase, { name, statement, primaryActorId })

        await this.useCaseRepository.update(useCase)
    }
}