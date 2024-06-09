import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type Component from "~/domain/Component"

type In = Pick<Component, 'id' | 'name' | 'statement'>

export default class UpdateComponentUseCase extends UseCase<In, void> {
    constructor(
        readonly componentRepository: Repository<Component>
    ) { super() }

    async execute({ id, name, statement }: In): Promise<void> {
        const component = await this.componentRepository.get(id)

        if (!component)
            throw new Error('Component term not found')

        Object.assign(component, { name, statement })

        await this.componentRepository.update(component)
    }
}