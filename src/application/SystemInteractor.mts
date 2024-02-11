import { Component, System, type Uuid } from '~/domain/index.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';
import treeFind from '~/lib/treeFind.mjs';

export default class SystemInteractor extends Interactor<System> {
    constructor({ presenter, repository }: {
        presenter: Presenter<System>;
        repository: Repository<System>;
    }) {
        super({ presenter, repository, Entity: System });
    }

    async createComponent(
        { systemId, parentId, label }: {
            systemId: Uuid;
            parentId?: Uuid;
            label: string;
        }
    ): Promise<Component> {
        const system = await this.repository.get(systemId);

        if (!system)
            throw new Error(`System ${systemId} not found`);

        const parent = !parentId ? system :
            system.components.map(c => treeFind(parentId, c))
                .find(x => x) ?? system,
            component = new Component({
                id: crypto.randomUUID(),
                name: label,
                statement: '',
                children: []
            });

        if (parent instanceof System)
            system.components.push(component);
        else
            parent.children.push(component);

        await this.repository.update(system);

        return component;
    }

    async deleteComponent(
        { systemId, id, parentId }: { systemId: Uuid; id: Uuid; parentId?: Uuid }
    ) {
        const system = await this.repository.get(systemId);

        if (!system)
            throw new Error(`System ${systemId} not found`);

        const parent = !parentId ? system :
            system.components.map(c => treeFind(parentId, c))
                .find(x => x) ?? system;

        if (parent instanceof System)
            system.components = system.components.filter(x => x.id !== id);
        else
            parent.children = parent.children.filter(x => x.id !== id);

        await this.repository.update(system);
    }

    async updateComponent(
        { systemId, id, parentId, label }:
            { systemId: Uuid; id: Uuid; parentId?: Uuid; label: string }
    ) {
        const system = await this.repository.get(systemId);

        if (!system)
            throw new Error(`System ${systemId} not found`);

        const parent = !parentId ? system :
            system.components.map(c => treeFind(parentId, c))
                .find(x => x) ?? system;

        if (parent instanceof System)
            parent.components = system.components.map(c =>
                c.id === id ? new Component({
                    id,
                    name: label,
                    statement: '',
                    children: c.children
                }) : c
            );
        else
            parent.children = parent.children.map(c =>
                c.id === id ? new Component({
                    id,
                    name: label,
                    statement: '',
                    children: c.children
                }) : c
            );

        await this.repository.update(system);
    }
}