import type { RequirementJson } from "~/mappers/RequirementToJsonMapper";
import NonFunctionalRequirement from "../domain/NonFunctionalRequirement";
import RequirementToJsonMapper from "~/mappers/RequirementToJsonMapper";

export interface NonFunctionalRequirementJson extends RequirementJson { }

export default class NonFunctionalRequirementToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: NonFunctionalRequirement): NonFunctionalRequirementJson {
        return {
            id: source.id,
            name: source.name,
            parentId: source.parentId,
            solutionId: source.solutionId,
            property: source.property,
            serializationVersion: this.serializationVersion,
            statement: source.statement
        };
    }

    override mapFrom(target: NonFunctionalRequirementJson): NonFunctionalRequirement {
        return new NonFunctionalRequirement({
            id: target.id,
            name: target.name,
            parentId: target.parentId,
            solutionId: target.solutionId,
            property: target.property,
            statement: target.statement
        });
    }
}