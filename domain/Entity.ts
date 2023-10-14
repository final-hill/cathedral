/**
 * An entity is an object that is not defined by its attributes,
 * but rather by a thread of continuity represented by its identity (id).
 */
export abstract class Entity<K> {
    /**
     * The unique identifier of the entity.
     */
    abstract id: K;

    /**
     * Compares two entities for equality.
     */
    equals(other: Entity<K>): boolean {
        return this.id === other.id;
    }
}