export abstract class Entity<K> {
    static fromJSON<K, E extends Entity<K>>(this: new (json: Record<string, any>) => E, json: Record<string, any>): E {
        return new this(json);
    }

    abstract id: K;

    equals(other: Entity<K>): boolean {
        return this.id === other.id;
    }

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