import { Project } from "~/domain/Project.mjs";
import { PEGSRepository } from "./PEGSRepository.mjs";

export class ProjectRepository extends PEGSRepository<Project> {
    constructor() { super('projects', Project) }
}