import { type Entity } from '~/domain/Entity.mjs';

export default abstract class Repository<E extends Entity> extends EventTarget {
    readonly EntityConstructor;

    constructor(EntityConstructor: typeof Entity) {
        super();
        this.EntityConstructor = EntityConstructor;
    }

    abstract getAll(): Promise<E[]>;

    abstract get(id: E['id']): Promise<E | undefined>;

    abstract add(item: E): Promise<void>;

    abstract update(item: E): Promise<void>;

    abstract delete(id: E['id']): Promise<void>;

    abstract clear(): Promise<void>;
}