import type Entity from '~/domain/Entity';
import type { Properties } from '~/domain/Properties.js';
import type { Uuid } from '~/domain/Uuid.js';
import { useAppConfig } from '#app'
import { PGlite } from "@electric-sql/pglite";

/**
 * A repository for entities.
 */
export default abstract class Repository<E extends Entity> {
    /**
     * The connection to the database.
     */
    static conn = new PGlite(useAppConfig().connString)

    /**
     * Creates an item to the repository.
     * @param item The properties of the item to create.
     * @returns The id of the added item.
     */
    abstract create(item: Omit<Properties<E>, 'id'>): Promise<Uuid>

    /**
     * Deletes an item from the repository.
     * @param id The id of the item to delete.
     */
    abstract delete(id: E['id']): Promise<void>;

    /**
     * Gets an item from the repository.
     * @param id The id of the item to get.
     * @returns The item with the given id, or undefined if it does not exist.
     */
    abstract get(id: E['id']): Promise<E | undefined>;

    /**
     * Gets all items in the repository.
     * @param criteria The criteria to filter the items by.
     * @returns All items in the repository.
     */
    abstract getAll(criteria?: Partial<Properties<E>>): Promise<E[]>;

    /**
     * Updates an item in the repository.
     * @param item The item to update.
     */
    abstract update(item: Properties<E>): Promise<void>;
}