import { Entity, type EntityJson } from "./Entity.mjs";
import type Predicate from "./types/Predicate.mjs";
import type Properties from "./types/Properties.mjs";

export interface RequirementJson extends EntityJson {
    statement: string;
}

/**
 * A Requirement is a statement that specifies a property.
 */
export abstract class Requirement extends Entity {
    private _property?: Predicate

    constructor(options: Properties<Requirement>) {
        super(options)

        this.statement = options.statement
    }

    /**
     * A statement is a human-readable description of a requirement.
     */
    statement: string

    /**
     * A property is a Predicate formalizing its associated statement.
     * @param args
     */
    property(...args: any[]): boolean {
        throw new Error("Method not implemented.");
    }

    override toJSON(): RequirementJson {
        return {
            ...super.toJSON(),
            statement: this.statement
        }
    }
}