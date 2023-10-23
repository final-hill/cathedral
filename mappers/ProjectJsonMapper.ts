import { Project } from "~/domain/Project";
import { type Mapper } from "~/usecases/Mapper";

export interface ProjectJson {
    id: string;
    name: string;
    description: string;
}

export class ProjectJsonMapper implements Mapper<Project, ProjectJson> {
    mapFrom(from: Project): ProjectJson {
        return {
            id: from.id,
            name: from.name,
            description: from.description
        }
    }
    mapTo(to: ProjectJson): Project {
        return new Project({
            id: to.id,
            name: to.name,
            description: to.description
        });
    }
}