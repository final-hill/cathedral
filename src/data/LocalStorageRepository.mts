import { type Entity } from "~/domain/Entity.mjs";
import Repository from "~/usecases/Repository.mjs";

export class LocalStorageRepository<E extends Entity> extends Repository<E> {
    private _storageKey;
    private _fromJSON;

    constructor(storageKey: string, EntityConstructor: typeof Entity) {
        super(EntityConstructor);

        this._storageKey = storageKey;
        this._fromJSON = EntityConstructor.fromJSON as (json: any) => E
    }

    get(id: E['id']): Promise<E | undefined> {
        const data = localStorage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            result = json.find((item) => item.id === id);

        return Promise.resolve(
            result ? this._fromJSON(result) : undefined
        );
    }

    getAll(filter: (entity: E) => boolean = (entity) => true): Promise<E[]> {
        const data = localStorage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            result = json.filter(filter).map(this._fromJSON);

        return Promise.resolve(result);
    }

    add(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [];
        json.push(item.toJSON() as E);
        localStorage.setItem(this._storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    update(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            index = json.findIndex((item) => item.id === item.id);

        if (index === -1)
            throw new Error('Not found');

        json[index] = item.toJSON() as E;
        localStorage.setItem(this._storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }

    delete(id: E['id']): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json: E[] = data ? JSON.parse(data) : [],
            index = json.findIndex((item) => item.id === id);

        if (index === -1)
            throw new Error('Not found');

        json.splice(index, 1);
        localStorage.setItem(this._storageKey, JSON.stringify(json));

        this.dispatchEvent(new CustomEvent('update'));

        return Promise.resolve();
    }
}