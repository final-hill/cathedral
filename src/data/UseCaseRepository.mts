import UseCase from '~/domain/UseCase.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';
import UseCaseToJsonMapper from '~/mappers/UseCaseToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class UseCaseRepository extends LocalStorageRepository<UseCase> {
    constructor() { super('use-case', new UseCaseToJsonMapper(pkg.version)); }
}