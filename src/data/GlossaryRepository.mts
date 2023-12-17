import GlossaryTerm from '~/domain/GlossaryTerm.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';
import GlossaryTermToJsonMapper from '~/mappers/GlossaryTermToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export class GlossaryRepository extends LocalStorageRepository<GlossaryTerm> {
    constructor() {
        super('glossary', new GlossaryTermToJsonMapper(pkg.version));
    }
}