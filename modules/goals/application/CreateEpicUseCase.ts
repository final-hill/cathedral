import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Goals from "../domain/Goals";
import Epic from "../domain/Epic";

type In = Pick<Epic, 'parentId' | 'name' | 'statement' | 'actorId'>;

export default class CreateEpicUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly epicRepository: Repository<Epic>,
    ) { super() }

    async execute(
        { parentId, name, statement, primaryActorId: actorId }: In
    ): Promise<Uuid> {
        return await this.epicRepository.add(new Epic({
            id: crypto.randomUUID(),
            actorId,
            parentId,
            name,
            statement,
            property: ''
        }))
    }
}