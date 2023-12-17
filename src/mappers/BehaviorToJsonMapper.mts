import Behavior from '~/domain/Behavior.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';

export interface BehaviorJson extends RequirementJson { }

export default class BehaviorToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: BehaviorJson): Behavior {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Behavior(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }
    override mapTo(source: Behavior): BehaviorJson {
        return super.mapTo(source);
    }
}