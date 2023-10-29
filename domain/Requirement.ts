import { Entity, type EntityJson } from "./Entity";
import type { Predicate } from "./types/Predicate";
import type { Properties } from "./types/Properties";

export interface RequirementJson extends EntityJson {
    statement: string;
}

/**
 * A Requirement is a statement that specifies a property.
 */
export abstract class Requirement extends Entity {
    private _statement
    private _property?: Predicate

    constructor(options: Properties<Requirement>) {
        super(options)

        this._statement = options.statement
    }

    /**
     * A statement is a human-readable description of a requirement.
     */
    get statement(): string { return this._statement }
    set statement(statement: string) { this._statement = statement }

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