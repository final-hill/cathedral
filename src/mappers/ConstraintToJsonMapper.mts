import { Constraint, ConstraintCategory } from '~/domain/index.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface ConstraintJson extends RequirementJson {
    category: ConstraintCategory;
}

export default class ConstraintToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: ConstraintJson): Constraint {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Constraint(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Constraint): ConstraintJson {
        return {
            ...super.mapTo(source),
            category: source.category
        };
    }
}