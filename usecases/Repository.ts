import { Entity } from "~/domain/Entity";
import { type Mapper } from "./Mapper";
import { stringify, parse } from 'zipson'

export abstract class Repository<E extends Entity<any>> {
    constructor(private _storageKey: string, private _mapper: Mapper<E, any>) { }

    getAll(): Promise<E[]> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            result = json.map((item: any) => this._mapper.mapTo(item))

        return Promise.resolve(result)
    }
    get(id: E['id']): Promise<E> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            result = json.find((item: any) => item.id === id)

        if (!result)
            throw new Error('Not found')

        return Promise.resolve(this._mapper.mapTo(result))
    }
    add(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : []
        json.push(this._mapper.mapFrom(item))
        localStorage.setItem(this._storageKey, stringify(json))

        return Promise.resolve()
    }
    update(item: E): Promise<void> {
        const data = localStorage.getItem(this._storageKey),
            json = data ? parse(data) : [],
            index = json.findIndex((item: any) => item.id === item.id)

        if (index === -1)
            throw new Error('Not found')

        json[index] = this._mapper.mapFrom(item)
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
}