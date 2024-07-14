import type Entity from "~/server/domain/Entity";
import type Repository from "./Repository";
import type { Uuid } from "~/server/domain/Uuid";
import type { Properties } from "~/server/domain/Properties";

export default abstract class Interactor<E extends Entity> {
    constructor(
        readonly repository: Repository<E>,
        readonly Constructor: new (props: Properties<E>) => E
    ) { }

    async create(item: Omit<Properties<E>, 'id'>): Promise<Uuid> {
        return await this.repository.add(item)
    }

    async delete(id: Uuid): Promise<void> {
        return await this.repository.delete(id)
    }

    async get(id: Uuid): Promise<E | undefined> {
        return await this.repository.get(id)
    }

    async getAll(criteria?: Partial<Properties<E>>): Promise<E[]> {
        return await this.repository.getAll(criteria)
    }

    async update(item: Properties<E>): Promise<void> {
        return this.repository.update(item)
    }
}