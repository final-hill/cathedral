import { Entity } from "./Entity";
import { GlossaryTerm } from "./GlossaryTerm";

/**
 * A glossary is a collection of terms with their definitions.
 * It is used to standardize the vocabulary used in the domain.
 */
export class Glossary extends Entity<string> {
    private _id: string
    private _terms: GlossaryTerm[] = []

    constructor({ id, terms }: { id?: string, terms?: GlossaryTerm[] }) {
        super();
        this._id = id || self.crypto.randomUUID();
        this._terms = terms || [];
    }

    get id(): string {
        return this._id;
    }

    /**
     * The terms in the glossary.
     */
    get terms(): GlossaryTerm[] {
        return this._terms;
    }

    toJSON(): Record<string, any> {
        return {
            id: this._id,
            terms: this._terms.map(term => term.toJSON())
        }
    }
}