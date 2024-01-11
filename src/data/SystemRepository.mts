import type System from '~/domain/System.mjs';
import type { SemVerString } from '~/lib/SemVer.mjs';
import StorageRepository from './StorageRepository.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import SystemToJsonMapper from '~/mappers/SystemToJsonMapper.mjs';

export default class SystemRepository extends StorageRepository<System> {
    constructor(storage: Storage) {
        super('system', storage, new SystemToJsonMapper(pkg.version as SemVerString));
    }
}