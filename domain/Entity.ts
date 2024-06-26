import type Equatable from "./Equatable";
import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";

/**
 * An entity is an object that is not defined by its attributes,
 * but rather by a thread of continuity represented by its identity (id).
 */
export default class Entity<I = Uuid> implements Equatable {
    /**
     * The unique identifier of the entity.
     */
    readonly id: I;

    constructor({ id }: { id: I }) {
        this.id = id as I;
    }

    equals(other: this): boolean {
        return this.id === other.id;
    }
}