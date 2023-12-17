import { type Properties } from '~/types/Properties.mjs';
import Entity from './Entity.mjs';

/**
 * A Requirement is a statement that specifies a property.
 */
export default class Requirement extends Entity {
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
    property(..._args: any[]): boolean {
        return false;
    }
}