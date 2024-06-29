import type Entity from '~/domain/Entity';
import type { Properties } from '~/domain/Properties.js';
import type { Uuid } from '~/domain/Uuid.js';

/**
 * A repository for entities.
 */
export default interface EntityRepository<E extends Entity> {
    /**
     * Adds an item to the repository.
     * @param item The properties of the item to add.
     * @returns The id of the added item.
     */
    add(item: Omit<Properties<E>, 'id'>): Promise<Uuid>

    /**
     * Deletes an item from the repository.
     * @param id The id of the item to delete.
     */
    delete(id: E['id']): Promise<void>;

    /**
     * Gets an item from the repository.
     * @param id The id of the item to get.
     * @returns The item with the given id, or undefined if it does not exist.
     */
    get(id: E['id']): Promise<E | undefined>;

    /**
     * Gets all items in the repository.
     * @param criteria The criteria to filter the items by.
     * @returns All items in the repository.
     */
    getAll(criteria?: Partial<Properties<E>>): Promise<E[]>;

    /**
     * Updates an item in the repository.
     * @param item The item to update.
     */
    update(item: Properties<E>): Promise<void>;
}