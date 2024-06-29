import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import GlossaryTerm from "../domain/GlossaryTerm";

export default class GlossaryTermRepository extends PGLiteEntityRepository<GlossaryTerm> {
    constructor() { super('cathedral.glossary_term', GlossaryTerm) }
}