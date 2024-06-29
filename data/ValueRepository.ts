import type { Properties } from '~/domain/Properties.js';
import type ValueObject from '~/domain/ValueObject';

/**
 * A repository for Value Objects
 */
export default interface ValueRepository<V extends ValueObject> {
    /**
     * Adds an item to the repository.
     * @param item The properties of the item to add
     */
    add(item: Properties<V>): Promise<void>

    /**
     * Deletes an item from the repository.
     * @param item The item to delete.
     */
    delete(item: Properties<V>): Promise<void>;

    /**
     * Gets all items in the repository.
     * @param criteria The criteria to filter the items by.
     * @returns All items in the repository.
     */
    getAll(criteria?: Partial<Properties<V>>): Promise<V[]>;
}