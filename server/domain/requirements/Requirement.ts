import { v7 as uuidv7 } from 'uuid';
import type { Properties } from "../Properties.js";
import Solution from '../application/Solution.js';

/**
 * A Requirement is a statement that specifies a property.
 */
export default abstract class Requirement {
    constructor({ name, statement, solution }: Omit<Properties<Requirement>, 'id'>) {
        this.id = uuidv7();
        this.name = name
        this.statement = statement
        this.solution = solution
    }

    /**
     * The unique identifier of the Requirement
     */
    id: string

    /**
     * A property is a Predicate formalizing its associated statement.
     * TODO: represented as a datalog string?
     */
    // property!: string

    /**
     * A short name for the requirement
     */
    name: string

    /**
     * A human-readable description of a property
     */
    statement: string

    /**
     * The solution that owns this requirement
     */
    solution: Solution

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            statement: this.statement,
            solutionId: this.solution.id
        }
    }
}
