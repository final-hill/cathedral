import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';
import { Assumption } from '~/domain/index.mjs';

export interface AssumptionJson extends RequirementJson { }

export default class AssumptionToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: AssumptionJson): Assumption {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Assumption(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Assumption): AssumptionJson {
        return super.mapTo(source);
    }
}