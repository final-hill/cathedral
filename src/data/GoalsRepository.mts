import Goals from '~/domain/Goals.mjs';
import PEGSRepository from './PEGSRepository.mjs';
import GoalsToJsonMapper from '~/mappers/GoalsToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };

export default class GoalsRepository extends PEGSRepository<Goals> {
    constructor(storage: Storage) {
        super('goals', storage, new GoalsToJsonMapper(pkg.version));
    }
}