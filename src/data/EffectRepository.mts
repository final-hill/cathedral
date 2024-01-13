import Effect from '~/domain/Effect.mjs';
import StorageRepository from './StorageRepository.mjs';
import EffectToJsonMapper from '~/mappers/EffectToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class EffectRepository extends StorageRepository<Effect> {
    constructor(storage: Storage) {
        super('effects', storage, new EffectToJsonMapper(pkg.version as SemVerString));
    }
}