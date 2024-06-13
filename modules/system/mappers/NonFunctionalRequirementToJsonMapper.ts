import type { RequirementJson } from "~/mappers/RequirementToJsonMapper";
import NonFunctionalRequirement from "../domain/NonFunctionalRequirement";
import RequirementToJsonMapper from "~/mappers/RequirementToJsonMapper";

export interface NonFunctionalRequirementJson extends RequirementJson { }

export default class NonFunctionalRequirementToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: NonFunctionalRequirement): NonFunctionalRequirementJson {
        return {
            ...super.mapTo(source)
        };
    }

    override mapFrom(target: NonFunctionalRequirementJson): NonFunctionalRequirement {
        return new NonFunctionalRequirement({
            ...super.mapFrom(target)
        });
    }
}