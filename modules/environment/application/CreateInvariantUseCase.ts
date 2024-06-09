import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";
import Invariant from "../domain/Invariant";

type In = Pick<Invariant, 'parentId' | 'name' | 'statement'>

export default class CreateInvariantUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly invariantRepository: Repository<Invariant>
    ) { super() }

    async execute({ parentId, name, statement }: In): Promise<Uuid> {
        const environment = await this.environmentRepository.get(parentId)

        if (!environment)
            throw new Error('Environment not found')

        const invariantId = await this.invariantRepository.add(new Invariant({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            name,
            statement
        }))

        environment.invariantIds.push(invariantId)
        await this.environmentRepository.update(environment)

        return invariantId
    }
}