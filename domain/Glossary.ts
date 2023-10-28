import { Entity } from "./Entity";
import type { Properties } from "./types/Properties";

export type GlossaryTerm = { term: string, definition: string }

/**
 * A glossary is a collection of terms with their definitions.
 * It is used to standardize the vocabulary used in the domain.
 */
export class Glossary extends Entity {
    static override fromJSON(json: any): Glossary {
        return new Glossary({
            id: json.id,
            terms: json.terms
        });
    }

    private _terms: GlossaryTerm[] = []

    constructor(options: Properties<Glossary>) {
        super(options);
        this._terms = options.terms;
    }

    /**
     * The terms in the glossary.
     */
    get terms(): GlossaryTerm[] {
        return this._terms;
    }

    override toJSON() {
        return {
            ...super.toJSON(),
            terms: this._terms
        }
    }
}