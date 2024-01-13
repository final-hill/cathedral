import SemVer from '~/lib/SemVer.mjs';
import RequirementToJsonMapper, { type RequirementJson } from './RequirementToJsonMapper.mjs';
import Effect from '~/domain/Effect.mjs';

export interface EffectJson extends RequirementJson { }

export default class EffectToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: EffectJson): Effect {
        const version = new SemVer(target.serializationVersion);

        if (version.gte('0.4.0'))
            return new Effect(target);

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Effect): EffectJson {
        return super.mapTo(source);
    }
}