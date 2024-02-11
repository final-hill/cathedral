import type { Properties } from '~/types/Properties.mjs';
import { type Uuid } from './index.mjs';

/**
 * An entity is an object that is not defined by its attributes,
 * but rather by a thread of continuity represented by its identity (id).
 */
export class Entity {
    /**
     * The unique identifier of the entity.
     */
    id: Uuid;

    constructor({ id }: Properties<Entity>) {
        this.id = id;
    }

    /**
     * Compares two entities for equality.
     * @param other - The other entity to compare.
     * @returns True if the entities are equal, false otherwise.
     */
    equals(other: Entity): boolean {
        return this.id === other.id;
    }
}