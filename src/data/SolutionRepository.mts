import type Solution from '~/domain/Solution.mjs';
import SolutionToJsonMapper from '~/mappers/SolutionToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';
import SlugRepository from './SlugRepository.mjs';

export default class SolutionRepository extends SlugRepository<Solution> {
    constructor(storage: Storage) {
        super('solution', storage, new SolutionToJsonMapper(pkg.version as SemVerString));
    }
}