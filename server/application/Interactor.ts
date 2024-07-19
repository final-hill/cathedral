import type Entity from "~/server/domain/Entity";
import type Repository from "./Repository";
import { type Properties } from "../domain/Properties";

export default abstract class Interactor<E extends Entity<any>> {
    constructor(
        readonly repository: Repository<E>,
        readonly Constructor: new (props: Properties<E>) => E
    ) { }

    async create(item: Omit<Properties<E>, 'id'>): Promise<E['id']> {
        return await this.repository.add(item)
    }

    async delete(id: E['id']): Promise<void> {
        return await this.repository.delete(id)
    }

    async get(id: E['id']): Promise<E | undefined> {
        return await this.repository.get(id)
    }

    async getAll(criteria?: Partial<Properties<E>>): Promise<E[]> {
        return await this.repository.getAll(criteria)
    }

    async update(item: Properties<E>): Promise<void> {
        return this.repository.update(item)
    }
}