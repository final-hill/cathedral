import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type Invariant from "../domain/Invariant"

type In = Pick<Invariant, 'id' | 'name' | 'statement'>

export default class UpdateInvariantUseCase extends UseCase<In, void> {
    constructor(
        readonly invariantRepository: Repository<Invariant>
    ) { super() }

    async execute({ id, name, statement }: In): Promise<void> {
        const invariant = await this.invariantRepository.get(id)

        if (!invariant)
            throw new Error('Invariant term not found')

        Object.assign(invariant, { name, statement })

        await this.invariantRepository.update(invariant)
    }
}