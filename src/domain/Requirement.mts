/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { type Properties } from '~/types/Properties.mjs';
import { Entity, type EntityJson } from './Entity.mjs';

export interface RequirementJson extends EntityJson {
    statement: string;
}

/**
 * A Requirement is a statement that specifies a property.
 */
export abstract class Requirement extends Entity {
    /**
     * A statement is a human-readable description of a requirement.
     */
    accessor statement: string;

    constructor(options: Properties<Requirement>) {
        super(options);

        this.statement = options.statement;
    }

    /**
     * A property is a Predicate formalizing its associated statement.
     * @param args - The arguments to the property.
     * @returns True if the property is satisfied, false otherwise.
     */
    abstract property(...args: any[]): boolean;

    override toJSON(): RequirementJson {
        return {
            ...super.toJSON(),
            statement: this.statement
        };
    }
}