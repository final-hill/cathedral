import type Entity from '~/domain/Entity';
import type Mapper from './Mapper.js';
import type { Properties } from '~/domain/Properties.js';
import type { Uuid } from '~/domain/Uuid.js';

export default abstract class Repository<E extends Entity> {
    private _mapper: Mapper<E, any>;

    constructor({ mapper }: Properties<Repository<E>>) {
        this._mapper = mapper;
    }

    get mapper(): Mapper<E, any> { return this._mapper; }

    abstract getAll(filter?: (entity: E) => boolean): Promise<E[]>;

    abstract get(id: E['id']): Promise<E | undefined>;

    abstract add(item: E): Promise<Uuid>

    abstract update(item: E): Promise<void>;

    abstract delete(id: E['id']): Promise<void>;

    abstract clear(): Promise<void>;
}