import type Solution from '~/domain/Solution.mjs';
import StorageRepository from './StorageRepository.mjs';
import SolutionToJsonMapper from '~/mappers/SolutionToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class SolutionRepository extends StorageRepository<Solution> {
    constructor(storage: Storage) {
        super('solution', storage, new SolutionToJsonMapper(pkg.version as SemVerString));
    }
}