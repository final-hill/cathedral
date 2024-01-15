import StorageRepository from './StorageRepository.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';
import { ComponentToJsonMapper } from '~/mappers/ComponentToJsonMapper.mjs';
import type Component from '~/domain/Component.mjs';

export default class BehaviorRepository extends StorageRepository<Component> {
    constructor(storage: Storage) {
        super('components', storage, new ComponentToJsonMapper(pkg.version as SemVerString));
    }
}