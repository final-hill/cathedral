import Stakeholder from '~/domain/Stakeholder.mjs';
import StorageRepository from './StorageRepository.mjs';
import StakeholderToJsonMapper from '~/mappers/StakeholderToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class StakeholderRepository extends StorageRepository<Stakeholder> {
    constructor(storage: Storage) {
        super('stakeholder', storage, new StakeholderToJsonMapper(pkg.version));
    }
}