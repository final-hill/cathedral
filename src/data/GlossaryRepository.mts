import GlossaryTerm from '~/domain/GlossaryTerm.mjs';
import StorageRepository from './StorageRepository.mjs';
import GlossaryTermToJsonMapper from '~/mappers/GlossaryTermToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class GlossaryRepository extends StorageRepository<GlossaryTerm> {
    constructor(storage: Storage) {
        super('glossary', storage, new GlossaryTermToJsonMapper(pkg.version));
    }
}