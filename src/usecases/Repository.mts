import type Entity from '~/domain/Entity.mjs';
import type Mapper from './Mapper.mjs';

export default abstract class Repository<E extends Entity> extends EventTarget {
    constructor(
        readonly mapper: Mapper<E, any>
    ) { super(); }

    abstract getAll(): Promise<E[]>;

    abstract get(id: E['id']): Promise<E | undefined>;

    abstract add(item: E): Promise<void>;

    abstract update(item: E): Promise<void>;

    abstract delete(id: E['id']): Promise<void>;

    abstract clear(): Promise<void>;
}