import { v7 as uuidv7 } from 'uuid';
import type { Properties } from "../Properties.js";
import Solution from '../application/Solution.js';
import AppUser from '../application/AppUser.js';

/**
 * A Requirement is a statement that specifies a property.
 */
export abstract class Requirement {
    constructor({ name, statement, solution, lastModified, modifiedBy }: Omit<Properties<Requirement>, 'id'>) {
        this.id = uuidv7();
        this.name = name;
        this.statement = statement;
        this.solution = solution;
        this.lastModified = lastModified;
        this.modifiedBy = modifiedBy;
    }

    /**
     * The unique identifier of the Requirement
     */
    id: string;
    /**
     * A property is a Predicate formalizing its associated statement.
     * TODO: represented as a datalog string?
     */
    // property!: string

    /**
     * A short name for the requirement
     */
    name: string;

    /**
     * A human-readable description of a property
     */
    statement: string;

    /**
     * The solution that owns this requirement
     */
    solution: Solution;

    /**
     * The date and time when the requirement was last modified
     */
    lastModified: Date;

    /**
     * The user who last modified the requirement
     */
    modifiedBy: AppUser;
}
