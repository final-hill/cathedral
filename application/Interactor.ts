import type Entity from "~/domain/Entity";
import type Repository from "./Repository";
import type { Uuid } from "~/domain/Uuid";

export default abstract class Interactor<E extends Entity> {
    constructor(
        readonly repository: Repository<E>
    ) { }

    abstract create(item: Omit<E, 'id'>): Promise<Uuid>

    abstract delete(id: Uuid): Promise<void>

    abstract getAll(parentId: Uuid): Promise<E[]>

    abstract update(item: Pick<E, 'id'>): Promise<void>
}