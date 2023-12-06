import { Goals } from '~/domain/Goals.mjs';
import { PEGSRepository } from './PEGSRepository.mjs';

export class GoalsRepository extends PEGSRepository<Goals> {
    constructor() { super('goals', Goals); }
}