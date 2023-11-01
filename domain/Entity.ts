import type { Uuid } from "./types/Uuid";
import { type Properties } from "./types/Properties";

export interface EntityJson {
    id: Uuid;
}

/**
 * An entity is an object that is not defined by its attributes,
 * but rather by a thread of continuity represented by its identity (id).
 */
export abstract class Entity {
    static fromJSON(json: any): Entity {
        throw new Error("Method not implemented.");
    }

    private _id: Uuid;

    constructor({ id }: Properties<Entity>) {
        this._id = id;
    }

    /**
     * The unique identifier of the entity.
     */
    get id(): Uuid {
        return this._id;
    }

    /**
     * Compares two entities for equality.
     */
    equals(other: Entity): boolean {
        return this.id === other.id;
    }

    toJSON(): EntityJson {
        return {
            id: this.id
        }
    }
}