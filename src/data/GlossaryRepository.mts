import { GlossaryTerm } from "~/domain/GlossaryTerm.mjs";
import { LocalStorageRepository } from "./LocalStorageRepository.mjs";

export class GlossaryRepository extends LocalStorageRepository<GlossaryTerm> {
    constructor() {
        super('glossary', GlossaryTerm);
    }
}