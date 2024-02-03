import System from '~/domain/System.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';
import Component from '~/domain/Component.mjs';
import type { Properties } from '~/types/Properties.mjs';

export default class SystemInteractor extends Interactor<System> {
    constructor({ presenter, repository }: {
        presenter: Presenter<System>;
        repository: Repository<System>;
    }) {
        super({ presenter, repository, Entity: System });
    }

    async createComponent(
        { systemId, name, description, interfaceDefinition }: {
            systemId: Uuid;
            name: string;
            description: string;
            interfaceDefinition: string;
        }
    ) {
        const system = await this.repository.get(systemId);

        if (!system)
            throw new Error(`System ${systemId} not found`);

        system.components.push(new Component({
            id: crypto.randomUUID(),
            name,
            description,
            statement: interfaceDefinition
        }));

        await this.repository.update(system);
    }

    async deleteComponent(
        { systemId, id }: { systemId: Uuid; id: Uuid }
    ) {
        const system = await this.repository.get(systemId);

        if (!system)
            throw new Error(`System ${systemId} not found`);

        system.components = system.components.filter(x => x.id !== id);
        await this.repository.update(system);
    }

    async updateComponent(
        { systemId, component }: { systemId: Uuid; component: Properties<Component> }
    ) {
        const system = await this.repository.get(systemId),
            newComponent = new Component(component);

        if (!system)
            throw new Error(`System ${systemId} not found`);

        system.components = system.components.map(x =>
            x.id === component.id ? newComponent : x
        );

        await this.repository.update(system);
    }
}