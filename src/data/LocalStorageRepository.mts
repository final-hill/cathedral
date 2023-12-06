/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { type Entity } from '~/domain/Entity.mjs';
import Repository from '~/usecases/Repository.mjs';

export class LocalStorageRepository<E extends Entity> extends Repository<E> {
    private _storageKey;
    private _fromJSON;

    constructor(storageKey: string, EntityConstructor: typeof Entity) {
        super(EntityConstructor);

        this._storageKey = storageKey;
        this._fromJSON = EntityConstructor.fromJSON as (json: any) => E;
    }

    get storage(): Storage {
        return localStorage;
    }

    get(id: E['id']): Promise<E | undefined> {
        const data = this.storage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            result = json.find(item => item.id === id);

        return Promise.resolve(
            result ? this._fromJSON(result) : undefined
        );
    }

    getAll(filter: (entity: E) => boolean = _ => true): Promise<E[]> {
        const data = this.storage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            result = json.filter(filter).map(this._fromJSON);

        return Promise.resolve(result);
    }

    add(item: E): Promise<void> {
        const data = this.storage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [];
        json.push(item.toJSON() as E);
        this.storage.setItem(this._storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    clear(): Promise<void> {
        this.storage.removeItem(this._storageKey);
        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    update(item: E): Promise<void> {
        const data = this.storage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            index = json.findIndex(e => e.id === item.id);

        if (index === -1)
            throw new Error('Not found');

        json[index] = item.toJSON() as E;
        this.storage.setItem(this._storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    delete(id: E['id']): Promise<void> {
        const data = this.storage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            index = json.findIndex(item => item.id === id);

        if (index === -1)
            throw new Error('Not found');

        json.splice(index, 1);
        this.storage.setItem(this._storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }
}