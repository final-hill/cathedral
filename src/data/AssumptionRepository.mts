import Assumption from '~/domain/Assumption.mjs';
import StorageRepository from './StorageRepository.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';
import AssumptionToJsonMapper from '~/mappers/AssumptionToJsonMapper.mjs';

export default class AssumptionRepository extends StorageRepository<Assumption> {
    constructor(storage: Storage) {
        super('assumption', storage, new AssumptionToJsonMapper(pkg.version as SemVerString));
    }
}