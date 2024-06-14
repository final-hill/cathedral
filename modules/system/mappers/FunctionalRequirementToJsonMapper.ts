import type { RequirementJson } from "~/mappers/RequirementToJsonMapper";
import FunctionalRequirement from "../domain/FunctionalRequirement";
import RequirementToJsonMapper from "~/mappers/RequirementToJsonMapper";

export interface FunctionalRequirementJson extends RequirementJson { }

export default class FunctionalRequirementToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: FunctionalRequirement): FunctionalRequirementJson {
        return {
            id: source.id,
            name: source.name,
            parentId: source.parentId,
            property: source.property,
            serializationVersion: this.serializationVersion,
            statement: source.statement,
            solutionId: source.solutionId
        };
    }

    override mapFrom(target: FunctionalRequirementJson): FunctionalRequirement {
        return new FunctionalRequirement({
            id: target.id,
            name: target.name,
            parentId: target.parentId,
            property: target.property,
            statement: target.statement,
            solutionId: target.solutionId
        });
    }
}