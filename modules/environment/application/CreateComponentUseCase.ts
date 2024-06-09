import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import type Environment from "../domain/Environment";
import Component from "~/domain/Component";

type In = Pick<Component, 'parentId' | 'name' | 'statement'>

export default class CreateComponentUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly environmentRepository: Repository<Environment>,
        readonly componentRepository: Repository<Component>
    ) { super() }

    async execute({ parentId, name, statement }: In): Promise<Uuid> {
        const environment = await this.environmentRepository.get(parentId)

        if (!environment)
            throw new Error('Environment not found')

        const componentId = await this.componentRepository.add(new Component({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            name,
            statement
        }))

        environment.componentIds.push(componentId)
        await this.environmentRepository.update(environment)

        return componentId
    }
}