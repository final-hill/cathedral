import PGLiteRepository from "~/data/PGLiteRepository";
import GlossaryTerm from "../domain/GlossaryTerm";

export default class GlossaryTermRepository extends PGLiteRepository<GlossaryTerm> {
    constructor() { super('cathedral.glossary_term', GlossaryTerm) }
}