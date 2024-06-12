import PEGSToJsonMapper, { type PEGSJson } from "~/mappers/PEGSToJsonMapper";
import Project from "../domain/Project";

export interface ProjectJson extends PEGSJson { }

export default class ProjectToJsonMapper extends PEGSToJsonMapper {
    override mapFrom(target: ProjectJson): Project {
        const pegs = super.mapFrom(target)

        return new Project({
            id: pegs.id,
            limitationIds: pegs.limitationIds,
            solutionId: pegs.solutionId,
            componentIds: pegs.componentIds
        });
    }

    override mapTo(source: Project): ProjectJson {
        return {
            ...super.mapTo(source as any)
        };
    }
}