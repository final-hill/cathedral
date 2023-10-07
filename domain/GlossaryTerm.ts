import { Entity } from "./Entity";

export class GlossaryTerm extends Entity<string> {
    private _term;
    private _description;

    constructor(term: string, description: string) {
        super()

        this._term = term;
        this._description = description;
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
    get description(): string {
        return this._description;
    }
}