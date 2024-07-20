import { ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import type { Properties } from "./Properties.js";
import Solution from './Solution.js';

/**
 * A Requirement is a statement that specifies a property.
 */
export default abstract class Requirement {
    constructor({ name, statement, solution }: Omit<Properties<Requirement>, 'id'>) {
        this.name = name
        this.statement = statement
        this.solution = solution
    }

    /**
     * The unique identifier of the Requirement
     */
    @PrimaryKey({ type: 'uuid' })
    id = uuidv7()

    /**
     * A property is a Predicate formalizing its associated statement.
     * TODO: represented as a datalog string?
     */
    // property!: string

    /**
     * A short name for the requirement
     */
    @Property()
    name!: string

    /**
     * A human-readable description of a property
     */
    @Property()
    statement!: string

    /**
     * The solution that owns this requirement
     */
    @ManyToOne()
    solution!: Solution
}
