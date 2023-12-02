import type { Properties } from "~/types/Properties.mjs";
import { Entity, type EntityJson } from "./Entity.mjs";

export interface GlossaryTermJson extends EntityJson {
    term: string;
    definition: string;
}

export class GlossaryTerm extends Entity {
    static override fromJSON(json: GlossaryTermJson): GlossaryTerm {
        return new GlossaryTerm({
            id: json.id,
            term: json.term,
            definition: json.definition
        });
    }

    definition: string;
    term: string;

    constructor({ id, term, definition }: Properties<GlossaryTerm>) {
        super({ id });
        this.term = term;
        this.definition = definition;
    }

    override toJSON(): GlossaryTermJson {
        return {
            ...super.toJSON(),
            term: this.term,
            definition: this.definition
        };
    }
}

export default GlossaryTerm;