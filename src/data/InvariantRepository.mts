import type Invariant from '~/domain/Invariant.mjs';
import StorageRepository from './StorageRepository.mjs';
import type { SemVerString } from '~/lib/SemVer.mjs';
import InvariantToJsonMapper from '~/mappers/InvariantToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class InvariantRepository extends StorageRepository<Invariant> {
    constructor(storage: Storage) {
        super('invariants', storage, new InvariantToJsonMapper(pkg.version as SemVerString));
    }
}