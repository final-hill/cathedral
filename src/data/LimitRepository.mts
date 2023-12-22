import Limit from '~/domain/Limit.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';
import LimitToJsonMapper from '~/mappers/LimitToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class UseCaseRepository extends LocalStorageRepository<Limit> {
    constructor() { super('limits', new LimitToJsonMapper(pkg.version)); }
}