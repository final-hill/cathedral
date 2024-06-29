import type Entity from "~/domain/Entity";
import type EntityRepository from "../data/EntityRepository";
import type { Uuid } from "~/domain/Uuid";
import type { Properties } from "~/domain/Properties";

export default abstract class Interactor<E extends Entity> {
    constructor(
        readonly repository: EntityRepository<E>
    ) { }

    create(item: Omit<Properties<E>, 'id'>): Promise<Uuid> {
        return this.repository.add(item)
    }

    delete(id: Uuid): Promise<void> {
        return this.repository.delete(id)
    }

    get(id: Uuid): Promise<E | undefined> {
        return this.repository.get(id)
    }

    getAll(criteria?: Partial<Properties<E>>): Promise<E[]> {
        return this.repository.getAll(criteria)
    }

    update(item: Properties<E>): Promise<void> {
        return this.repository.update(item)
    }
}