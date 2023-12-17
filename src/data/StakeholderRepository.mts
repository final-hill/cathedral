import Stakeholder from '~/domain/Stakeholder.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';
import StakeholderToJsonMapper from '~/mappers/StakeholderToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export class StakeholderRepository extends LocalStorageRepository<Stakeholder> {
    constructor() { super('stakeholder', new StakeholderToJsonMapper(pkg.version)); }
}