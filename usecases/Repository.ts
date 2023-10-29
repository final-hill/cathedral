import { Entity } from "~/domain/Entity";

export abstract class Repository<E extends Entity> {
    constructor(readonly EntityConstructor: typeof Entity) { }

    abstract getAll(): Promise<E[]>
    abstract get(id: E['id']): Promise<E>
    abstract add(item: E): Promise<void>
    abstract update(item: E): Promise<void>
    abstract delete(id: E['id']): Promise<void>
}