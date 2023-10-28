import { Entity } from "~/domain/Entity";
import type { Constructor } from "~/domain/types/Constructor";

export abstract class Repository<E extends Entity> {
    constructor(readonly EntityConstructor: Constructor<E>) { }

    abstract getAll(): Promise<E[]>
    abstract get(id: E['id']): Promise<E>
    abstract add(item: E): Promise<void>
    abstract update(item: E): Promise<void>
    abstract delete(id: E['id']): Promise<void>
}