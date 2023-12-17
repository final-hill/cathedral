import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import { Goal } from '~/domain/Goal.mjs';

export interface GoalJson extends RequirementJson { }

export default class GoalToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: GoalJson): Goal {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Goal(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }
    override mapTo(source: Goal): GoalJson {
        return super.mapTo(source);
    }
}