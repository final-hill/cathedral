import type { Uuid } from "~/domain/Uuid";
import Solution from "../domain/Solution";
import SemVer from "~/domain/SemVer";
import EntityToJsonMapper, { type EntityJson } from "~/mappers/EntityToJsonMapper";

export interface SolutionJson extends EntityJson {
    name: string;
    description: string;
    projectId: Uuid;
    environmentId: Uuid;
    goalsId: Uuid;
    systemId: Uuid;
}

export default class SolutionToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: SolutionJson): Solution {
        const version = new SemVer(target.serializationVersion);

        return new Solution(target);
    }

    override mapTo(source: Solution): SolutionJson {
        return {
            ...super.mapTo(source),
            name: source.name,
            description: source.description,
            projectId: source.projectId,
            environmentId: source.environmentId,
            goalsId: source.goalsId,
            systemId: source.systemId
        };
    }
}