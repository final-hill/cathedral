import type { RequirementJson } from "~/mappers/RequirementToJsonMapper";
import FunctionalRequirement from "../domain/FunctionalRequirement";
import RequirementToJsonMapper from "~/mappers/RequirementToJsonMapper";

export interface FunctionalRequirementJson extends RequirementJson { }

export default class FunctionalRequirementToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: FunctionalRequirement): FunctionalRequirementJson {
        return {
            ...super.mapTo(source)
        };
    }

    override mapFrom(target: FunctionalRequirementJson): FunctionalRequirement {
        return new FunctionalRequirement({
            ...super.mapFrom(target)
        });
    }
}