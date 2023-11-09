import { Entity } from "domain/Entity.mjs";
import Repository from "usecases/Repository.mjs";
import { stringify, parse } from 'zipson'

export class LocalStorageRepository<E extends Entity> extends Repository<E> {
    private _storageKey
    private _fromJSON

    constructor(storageKey: string, EntityConstructor: typeof Entity) {
        super(EntityConstructor)
        this._storageKey = storageKey
        this._fromJSON = EntityConstructor.fromJSON
    }

    get(id: E['id']): Promise<E | undefined> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            result = json.find((item: any) => item.id === id)

        return Promise.resolve(
            result ? this._fromJSON(result) as E : undefined
        )
    }

    getAll(filter = (entity: E) => true): Promise<E[]> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            result = json.filter(filter).map(this._fromJSON)

        return Promise.resolve(result)
    }

    add(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : []
        json.push(item.toJSON())
        localStorage.setItem(this._storageKey, stringify(json))

        this.dispatchEvent(new CustomEvent('update'))

        return Promise.resolve()
    }

    update(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            index = json.findIndex((item: any) => item.id === item.id)

        if (index === -1)
            throw new Error('Not found')

        json[index] = item.toJSON()
        localStorage.setItem(this._storageKey, stringify(json))

        this.dispatchEvent(new CustomEvent('update'))

        return Promise.resolve()
    }

    delete(id: E['id']): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            index = json.findIndex((item: any) => item.id === id)

        if (index === -1)
            throw new Error('Not found')

        json.splice(index, 1)
        localStorage.setItem(this._storageKey, stringify(json))

        this.dispatchEvent(new CustomEvent('update'))

        return Promise.resolve()
    }
}