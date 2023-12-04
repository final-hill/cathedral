/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';

export interface EntityJson {
    id: Uuid;
}

/**
 * An entity is an object that is not defined by its attributes,
 * but rather by a thread of continuity represented by its identity (id).
 */
export class Entity {
    static emptyId: Uuid = '00000000-0000-0000-0000-000000000000';

    /**
     * Creates an instance of the object from a JSON representation.
     * @param json - The JSON representation of the object.
     * @returns The object.
     */
    static fromJSON({ id }: EntityJson): Entity {
        return new Entity({ id });
    }

    #id: Uuid;

    constructor({ id }: Properties<Entity>) {
        this.#id = id;
    }

    /**
     * The unique identifier of the entity.
     */
    get id() {
        return this.#id;
    }

    /**
     * Compares two entities for equality.
     * @param other - The other entity to compare.
     * @returns True if the entities are equal, false otherwise.
     */
    equals(other: Entity): boolean {
        return this.id === other.id;
    }

    /**
     * Converts the entity to a JSON representation.
     * @returns The JSON representation of the entity.
     */
    toJSON(): EntityJson {
        return {
            id: this.#id
        };
    }
}