import Constraint from '~/domain/Constraint.mjs';
import StorageRepository from './StorageRepository.mjs';
import ConstraintToJsonMapper from '~/mappers/ConstraintToJsonMapper.mjs';
import pkg from '~/../package.json' with { type: 'json' };
import type { SemVerString } from '~/lib/SemVer.mjs';

export default class ConstraintRepository extends StorageRepository<Constraint> {
    constructor(storage: Storage) {
        super('constraints', storage, new ConstraintToJsonMapper(pkg.version as SemVerString));
    }
}