import type { EntityJson } from '~/mappers/EntityToJsonMapper';
import Repository from '~/application/Repository';
import type Entity from '~/domain/Entity';
import type Mapper from '~/application/Mapper';
import type { Properties } from '~/domain/Properties';
import type { Uuid } from '~/domain/Uuid';

export default class StorageRepository<E extends Entity> extends Repository<E> {
    readonly storageKey: string
    private readonly _storage: Storage = localStorage

    constructor({ storageKey, ...rest }: Properties<StorageRepository<E>>) {
        super(rest);

        this.storageKey = storageKey;
    }

    override get mapper(): Mapper<E, EntityJson> {
        return super.mapper;
    }

    get(id: E['id']): Promise<E | undefined> {
        const data = this._storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            result = json.find(item => item.id === id);

        return Promise.resolve(
            result ? this.mapper.mapFrom(result) : undefined
        );
    }

    getAll(filter: (entity: E) => boolean = _ => true): Promise<E[]> {
        const data = this._storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            result = json.map(this.mapper.mapFrom).filter(filter);

        return Promise.resolve(result);
    }

    async add(item: E): Promise<Uuid> {
        const data = this._storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [];
        json.push(this.mapper.mapTo(item));
        this._storage.setItem(this.storageKey, JSON.stringify(json));

        return item.id;
    }

    clear(): Promise<void> {
        this._storage.removeItem(this.storageKey);

        return Promise.resolve();
    }

    update(item: E): Promise<void> {
        const data = this._storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            index = json.findIndex(e => e.id === item.id);

        if (index === -1)
            throw new Error('Not found');

        json[index] = this.mapper.mapTo(item);
        this._storage.setItem(this.storageKey, JSON.stringify(json));

        return Promise.resolve();
    }

    delete(id: E['id']): Promise<void> {
        const data = this._storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            index = json.findIndex(item => item.id === id);

        if (index === -1)
            throw new Error('Not found');

        json.splice(index, 1);
        this._storage.setItem(this.storageKey, JSON.stringify(json));

        return Promise.resolve();
    }
}