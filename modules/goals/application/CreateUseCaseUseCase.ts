import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Goals from "../domain/Goals";
import DomainUseCase from '~/domain/UseCase';

type In = Pick<DomainUseCase, 'parentId' | 'name' | 'statement' | 'primaryActorId'>;

export default class CreateUseCaseUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly useCaseRepository: Repository<DomainUseCase>,
    ) { super() }

    async execute(
        { parentId, primaryActorId, name, statement }: In
    ): Promise<Uuid> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        const useCaseId = await this.useCaseRepository.add(new DomainUseCase({
            id: crypto.randomUUID(),
            primaryActorId,
            parentId,
            name,
            statement,
            property: ''
        }))

        goals.useCases.push(useCaseId)

        await this.goalsRepository.update(goals)

        return useCaseId
    }
}