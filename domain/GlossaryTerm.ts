import { Entity, type EntityJson } from "./Entity";
import type { Properties } from "./types/Properties";

export interface GlossaryTermJson extends EntityJson {
    term: string;
    definition: string;
}

export class GlossaryTerm extends Entity {
    term: string;
    definition: string;

    static fromJSON(json: GlossaryTermJson): GlossaryTerm {
        return new GlossaryTerm({
            id: json.id,
            term: json.term,
            definition: json.definition
        });
    }

    constructor({ id, term, definition }: Properties<GlossaryTerm>) {
        super({ id });
        this.term = term;
        this.definition = definition;
    }

    toJSON(): GlossaryTermJson {
        return {
            ...super.toJSON(),
            term: this.term,
            definition: this.definition
        }
    }
}
