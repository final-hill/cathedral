import Behavior from '~/domain/Behavior.mjs';
import StorageRepository from './StorageRepository.mjs';
import BehaviorToJsonMapper from '~/mappers/BehaviorToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class BehaviorRepository extends StorageRepository<Behavior> {
    constructor(storage: Storage) {
        super('behavior', storage, new BehaviorToJsonMapper(pkg.version));
    }
}