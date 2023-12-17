import Behavior from '~/domain/Behavior.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';
import BehaviorToJsonMapper from '~/mappers/BehaviorToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export class BehaviorRepository extends LocalStorageRepository<Behavior> {
    constructor() { super('behavior', new BehaviorToJsonMapper(pkg.version)); }
}