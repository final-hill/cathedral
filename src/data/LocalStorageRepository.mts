import type Entity from '~/domain/Entity.mjs';
import type { EntityJson } from '~/mappers/EntityToJsonMapper.mjs';
import type Mapper from '~/usecases/Mapper.mjs';
import Repository from '~/usecases/Repository.mjs';

export class LocalStorageRepository<E extends Entity> extends Repository<E> {
    constructor(readonly storageKey: string, mapper: Mapper<E, EntityJson>) {
        super(mapper);
    }

    get storage(): Storage {
        return localStorage;
    }

    get(id: E['id']): Promise<E | undefined> {
        const data = this.storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            result = json.find(item => item.id === id);

        return Promise.resolve(
            result ? this.mapper.mapFrom(result) : undefined
        );
    }

    getAll(filter: (entity: E) => boolean = _ => true): Promise<E[]> {
        const data = this.storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            result = json.map(this.mapper.mapFrom).filter(filter);

        return Promise.resolve(result);
    }

    add(item: E): Promise<void> {
        const data = this.storage.getItem(this.storageKey),
            json: E[] = data ? JSON.parse(data) : [];
        json.push(this.mapper.mapTo(item));
        this.storage.setItem(this.storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    clear(): Promise<void> {
        this.storage.removeItem(this.storageKey);
        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    update(item: E): Promise<void> {
        const data = this.storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            index = json.findIndex(e => e.id === item.id);

        if (index === -1)
            throw new Error('Not found');

        json[index] = this.mapper.mapTo(item);
        this.storage.setItem(this.storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    delete(id: E['id']): Promise<void> {
        const data = this.storage.getItem(this.storageKey),
            json: EntityJson[] = data ? JSON.parse(data) : [],
            index = json.findIndex(item => item.id === id);

        if (index === -1)
            throw new Error('Not found');

        json.splice(index, 1);
        this.storage.setItem(this.storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }
}