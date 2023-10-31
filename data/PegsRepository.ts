import type { Environment } from "~/domain/Environment";
import type { Goals } from "~/domain/Goals";
import type { Project } from "~/domain/Project";
import { Repository } from "~/usecases/Repository";
import { stringify, parse } from 'zipson'

export class PegsRepository<E extends Project | Environment | Goals> extends Repository<E> {
    private _storageKey
    private _fromJSON

    constructor(EntityConstructor: typeof Project | typeof Environment | typeof Goals) {
        super(EntityConstructor)
        this._storageKey = EntityConstructor.STORAGE_KEY
        this._fromJSON = EntityConstructor.fromJSON
    }

    getAll(): Promise<E[]> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            result = json.map(this._fromJSON)

        return Promise.resolve(result)
    }
    get(id: E['id']): Promise<E> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            result = json.find((item: any) => item.id === id)

        if (!result)
            throw new Error('Not found')

        return Promise.resolve(this._fromJSON(result) as E)
    }
    add(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : []
        json.push(item.toJSON())
        localStorage.setItem(this._storageKey, stringify(json))

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

        return Promise.resolve()
    }

    async getBySlug(slug: string): Promise<E> {
        const all = await this.getAll(),
            found = all.find(e => e.slug() === slug)
        if (!found)
            throw new Error(`No environment found with slug ${slug}`)
        return found
    }
}