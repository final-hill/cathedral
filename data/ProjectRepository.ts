import { Project } from "~/domain/Project";
import { ProjectJsonMapper } from "~/mappers/ProjectJsonMapper";
import { Repository } from "~/usecases/Repository";

export class ProjectRepository extends Repository<Project> {
    constructor() {
        super('projects', new ProjectJsonMapper())
    }
}