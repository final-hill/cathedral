import { Glossary } from "~/domain/Glossary";
import { type Mapper } from "~/usecases/Mapper";

export interface GlossaryTermJson {
    term: string;
    definition: string;
}

export interface GlossaryJson {
    id: string;
    terms: GlossaryTermJson[];
}

export class GlossaryJsonMapper implements Mapper<Glossary, GlossaryJson> {
    mapFrom(from: Glossary): GlossaryJson {
        return {
            id: from.id,
            terms: from.terms.map((t) => ({
                term: t.term,
                definition: t.definition
            }))
        }
    }
    mapTo(to: GlossaryJson): Glossary {
        return new Glossary({
            id: to.id,
            terms: to.terms.map((t) => ({
                term: t.term,
                definition: t.definition
            }))
        });
    }
}