import Environment from '~/domain/Environment.mjs';
import PEGSRepository from './PEGSRepository.mjs';
import EnvironmentToJsonMapper from '~/mappers/EnvironmentToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class EnvironmentRepository extends PEGSRepository<Environment> {
    constructor(storage: Storage) {
        super('environments', storage, new EnvironmentToJsonMapper(pkg.version as SemVerString));
    }
}