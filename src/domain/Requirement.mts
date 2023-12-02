import { type Properties } from "~/types/Properties.mjs";
import { Entity, type EntityJson } from "./Entity.mjs";

export interface RequirementJson extends EntityJson {
    statement: string
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
        super(options)

        this.statement = options.statement;
    }

    /**
     * A property is a Predicate formalizing its associated statement.
     */
    property(...args: any[]): boolean {
        throw new Error("Method not implemented.");
    }

    override toJSON(): RequirementJson {
        return {
            ...super.toJSON(),
            statement: this.statement
        };
    }
}