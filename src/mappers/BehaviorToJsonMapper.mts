import Behavior from '~/domain/Behavior.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import SemVer from '~/lib/SemVer.mjs';

export interface BehaviorJson extends RequirementJson { }

export default class BehaviorToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: BehaviorJson): Behavior {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.3.0'))
            return new Behavior(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Behavior): BehaviorJson {
        return super.mapTo(source);
    }
}