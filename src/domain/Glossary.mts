import { Entity, type EntityJson } from "./Entity.mjs";
import { GlossaryTerm, type GlossaryTermJson } from "./GlossaryTerm.mjs";
import type Properties from "./types/Properties.mjs";

export interface GlossaryJson extends EntityJson {
    terms: GlossaryTermJson[];
}

/**
 * A glossary is a collection of terms with their definitions.
 * It is used to standardize the vocabulary used in the domain.
 */
export class Glossary extends Entity {
    static override fromJSON(json: GlossaryJson): Glossary {
        return new Glossary({
            id: json.id as Glossary['id'],
            terms: json.terms.map(term => GlossaryTerm.fromJSON(term))
        });
    }

    constructor(options: Properties<Glossary>) {
        super(options);
        this.terms = options.terms;
    }

    /**
     * The terms in the glossary.
    */
    terms: GlossaryTerm[]

    override toJSON(): GlossaryJson {
        return {
            ...super.toJSON(),
            terms: this.terms.map(term => term.toJSON())
        }
    }
}