import Limit from '~/domain/Limit.mjs';
import StorageRepository from './StorageRepository.mjs';
import LimitToJsonMapper from '~/mappers/LimitToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class UseCaseRepository extends StorageRepository<Limit> {
    constructor(storage: Storage) {
        super('limits', storage, new LimitToJsonMapper(pkg.version as SemVerString));
    }
}