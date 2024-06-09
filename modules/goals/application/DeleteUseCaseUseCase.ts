import UseCase from "~/application/UseCase";
import type DomainUseCase from "~/domain/UseCase";
import type Repository from "~/application/Repository";
import type Goals from "../domain/Goals";

type In = Pick<DomainUseCase, 'parentId' | 'id'>

export default class DeleteUseCaseUseCase extends UseCase<In, void> {
    constructor(
        readonly goalsRepository: Repository<Goals>,
        readonly useCaseRepository: Repository<DomainUseCase>
    ) { super() }

    async execute({ parentId, id }: In): Promise<void> {
        const goals = await this.goalsRepository.get(parentId)

        if (!goals)
            throw new Error('Goals not found')

        goals.useCases = goals.useCases.filter(uid => uid !== id)

        await this.goalsRepository.update(goals)
        await this.useCaseRepository.delete(id)
    }
}