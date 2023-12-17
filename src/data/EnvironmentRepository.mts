import Environment from '~/domain/Environment.mjs';
import { PEGSRepository } from './PEGSRepository.mjs';
import EnvironmentToJsonMapper from '~/mappers/EnvironmentToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export class EnvironmentRepository extends PEGSRepository<Environment> {
    constructor() { super('environments', new EnvironmentToJsonMapper(pkg.version)); }
}