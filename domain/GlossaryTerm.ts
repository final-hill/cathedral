import { Entity } from "./Entity";

export class GlossaryTerm extends Entity<string> {
    private _term;
    private _definition;

    constructor({ term, definition }: { term: string, definition: string }) {
        super()

        this._term = term;
        this._definition = definition;
    }

    get id(): string {
        return this._term;
    }

    /**
     * The term being defined.
     */
    get term(): string {
        return this._term;
    }

    /**
     * The definition of the term.
     */
    get definition(): string {
        return this._definition;
    }

    toJSON(): Record<string, any> {
        return {
            term: this._term,
            definition: this._definition
        }
    }
}