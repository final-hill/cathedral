import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type EnvironmentComponent from "../domain/EnvironmentComponent"

type In = Pick<EnvironmentComponent, 'id' | 'name' | 'statement'>

export default class UpdateEnvironmentComponentUseCase extends UseCase<In, void> {
    constructor(
        readonly componentRepository: Repository<EnvironmentComponent>
    ) { super() }

    async execute({ id, name, statement }: In): Promise<void> {
        const environmentComponent = await this.componentRepository.get(id)

        if (!environmentComponent)
            throw new Error('Component term not found')

        Object.assign(environmentComponent, { name, statement })

        await this.componentRepository.update(environmentComponent)
    }
}