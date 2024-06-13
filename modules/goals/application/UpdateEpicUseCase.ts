import UseCase from "~/application/UseCase";
import type Repository from "~/application/Repository";
import type Epic from "../domain/Epic";

type In = Pick<Epic, 'id' | 'name' | 'actorId' | 'statement'>;

export default class UpdateEpicUseCase extends UseCase<In, void> {
    constructor(
        readonly epicRepository: Repository<Epic>
    ) { super() }

    async execute(
        { id, primaryActorId: actorId, name, statement }: In
    ): Promise<void> {
        const epic = await this.epicRepository.get(id)

        if (!epic)
            throw new Error('Epic not found')

        Object.assign(epic, { name, statement, actorId })

        await this.epicRepository.update(epic)
    }
}