import Entity from "./Entity";
import type { Properties } from "./Properties";
import type { Uuid } from "./Uuid";

/**
 * A Requirement is a statement that specifies a property.
 */
export default class Requirement extends Entity {

    constructor({ id, ...rest }: Properties<Requirement>) {
        super({ id })

        Object.assign(this, rest)
    }

    /**
     * The parent of a requirement is an aggregate of requirements.
     */
    parentId!: Uuid

    /**
     * A property is a Predicate formalizing its associated statement.
     * Currently, this is represented as a datalog string.
     */
    property!: string

    /**
     * A short name for the requirement
     */
    name!: string

    /**
     * A human-readable description of a property
     */
    statement!: string

    /**
     * The solution that owns this requirement
     */
    solutionId!: Uuid
}
