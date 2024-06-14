import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Effect from "../domain/Effect";

export interface EffectJson extends RequirementJson { }

export default class EffectToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: Effect): EffectJson {
        return { ...super.mapTo(source) };
    }

    override mapFrom(target: EffectJson): Effect {
        return new Effect({ ...target });
    }
}