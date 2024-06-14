import SemVer from "~/domain/SemVer";
import type { EntityJson } from "./EntityToJsonMapper";
import Requirement from "~/domain/Requirement";
import EntityToJsonMapper from "./EntityToJsonMapper";
import type { Uuid } from "~/domain/Uuid";

export interface RequirementJson extends EntityJson {
    name: string
    statement: string
    property: string
    parentId: Uuid
    solutionId: Uuid
}

export default class RequirementToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: RequirementJson): Requirement {
        return new Requirement(target);
    }

    override mapTo(source: Requirement): RequirementJson {
        return {
            ...super.mapTo(source as any),
            parentId: source.parentId,
            name: source.name,
            statement: source.statement,
            property: source.property,
            solutionId: source.solutionId
        };
    }
}