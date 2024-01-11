import Goals from '~/domain/Goals.mjs';
import StorageRepository from './StorageRepository.mjs';
import GoalsToJsonMapper from '~/mappers/GoalsToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class GoalsRepository extends StorageRepository<Goals> {
    constructor(storage: Storage) {
        super('goals', storage, new GoalsToJsonMapper(pkg.version as SemVerString));
    }
}