/**
 * An entity is an object that is not defined by its attributes,
 * but rather by a thread of continuity represented by its identity (id).
 */
export abstract class Entity<K> {
    /**
     * Creates an entity from a JSON object.
     */
    static fromJSON<K, E extends Entity<K>>(this: new (json: Record<string, any>) => E, json: Record<string, any>): E {
        return new this(json);
    }

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

    /**
     * Returns a JSON representation of the entity.
     */
    abstract toJSON(): Record<string, any>
}