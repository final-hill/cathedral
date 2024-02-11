import { type Properties } from '~/types/Properties.mjs';
import { Entity } from './index.mjs';

/**
 * A Requirement is a statement that specifies a property.
 */
export class Requirement extends Entity {
    /**
     * A statement is a human-readable description of a requirement.
     */
    accessor statement: string;

    constructor({ id, statement }: Properties<Requirement>) {
        super({ id });

        this.statement = statement;
    }

    /**
     * A property is a Predicate formalizing its associated statement.
     * @param args - The arguments to the property.
     * @returns True if the property is satisfied, false otherwise.
     */
    property(..._args: any[]): boolean {
        return false;
    }
}