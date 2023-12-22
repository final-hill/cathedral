import Limit from '~/domain/Limit.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';

export interface LimitJson extends RequirementJson { }

export default class BehaviorToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: LimitJson): Limit {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Limit(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }
    override mapTo(source: Limit): LimitJson {
        return super.mapTo(source);
    }
}