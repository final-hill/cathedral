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
    toJSON(): Record<string, any> {
        const json: Record<string, any> = {};
        const properties = Object.getOwnPropertyNames(this);
        const getters = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        for (const property of [...properties, ...getters]) {
            const descriptor = Object.getOwnPropertyDescriptor(this, property) || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), property);
            if (descriptor && descriptor.enumerable)
                json[property] = Reflect.get(this, property);
        }
        return json;
    }
}