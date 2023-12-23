import Limit from '~/domain/Limit.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface LimitJson extends RequirementJson { }

export default class BehaviorToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: LimitJson): Limit {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new Limit(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Limit): LimitJson {
        return super.mapTo(source);
    }
}