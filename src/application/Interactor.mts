import type Entity from '~/domain/Entity.mjs';
import type Repository from './Repository.mjs';
import type Presenter from './Presenter.mjs';
import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';

export default abstract class Interactor<E extends Entity> {
    #presenter; #repository; #Entity;

    constructor({ presenter, repository, Entity }:
        {
            presenter: Presenter<E>;
            repository: Repository<E>;
            Entity: new (properties: Properties<E>) => E;
        }
    ) {
        this.#presenter = presenter;
        this.#repository = repository;
        this.#Entity = Entity;
    }

    get presenter() { return this.#presenter; }
    get repository() { return this.#repository; }

    async create(properties: Omit<Properties<E>, 'id'>): Promise<E> {
        const entity = new this.#Entity({
            ...properties,
            id: crypto.randomUUID()
        } as any);

        await this.#repository.add(entity);

        return entity;
    }

    async getById(id: Uuid): Promise<E | undefined> {
        return await this.#repository.get(id);
    }

    async delete(id: Uuid): Promise<void> {
        await this.#repository.delete(id);
    }

    async update(entity: Properties<E>): Promise<void> {
        await this.repository.update(new this.#Entity(entity));
    }

    async presentList(filter: (entity: E) => boolean = () => true): Promise<void> {
        const items = await this.repository.getAll(filter);
        this.presenter.presentList(items);
    }

    async presentItem(id: Uuid): Promise<void> {
        const item = await this.repository.get(id);
        if (!item)
            throw new Error(`Item with id ${id} not found`);
        else
            this.presenter.presentItem(item);
    }
}