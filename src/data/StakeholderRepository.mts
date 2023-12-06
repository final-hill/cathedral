import { Stakeholder } from '~/domain/Stakeholder.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';

export class StakeholderRepository extends LocalStorageRepository<Stakeholder> {
    constructor() { super('stakeholder', Stakeholder); }
}