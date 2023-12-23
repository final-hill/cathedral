import UseCase from '~/domain/UseCase.mjs';
import StorageRepository from './StorageRepository.mjs';
import UseCaseToJsonMapper from '~/mappers/UseCaseToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class UseCaseRepository extends StorageRepository<UseCase> {
    constructor(storage: Storage) {
        super('use-case', storage, new UseCaseToJsonMapper(pkg.version));
    }
}