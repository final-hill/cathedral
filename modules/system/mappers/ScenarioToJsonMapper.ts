import type { Uuid } from "~/domain/Uuid";
import Scenario from "../domain/Scenario";
import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";

export interface ScenarioJson extends RequirementJson {
    primaryActorId: Uuid
}

export default class ScenarioToJsonMapper extends RequirementToJsonMapper {
    override mapFrom(target: ScenarioJson): Scenario {
        return new Scenario(target);
    }

    override mapTo(source: Scenario): ScenarioJson {
        return {
            ...super.mapTo(source as any),
            primaryActorId: source.primaryActorId
        };
    }
}