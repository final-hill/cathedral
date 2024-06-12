import UseCase from "~/application/UseCase"
import type Repository from "~/application/Repository"
import type SystemComponent from "../domain/SystemComponent"

type In = Pick<SystemComponent, 'id' | 'name' | 'statement' | 'parentId'>

export default class UpdateSystemComponentUseCase extends UseCase<In, void> {
    constructor(
        readonly componentRepository: Repository<SystemComponent>
    ) { super() }

    async execute({ id, name, statement, parentId }: In): Promise<void> {
        const systemComponent = await this.componentRepository.get(id)

        if (!systemComponent)
            throw new Error('Component term not found')

        Object.assign(systemComponent, { name, statement, parentId })

        await this.componentRepository.update(systemComponent)
    }
}