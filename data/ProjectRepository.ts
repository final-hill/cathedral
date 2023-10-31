import { Project } from "~/domain/Project";
import { PegsRepository } from "./PegsRepository";

export class ProjectRepository extends PegsRepository<Project> {
    constructor() { super(Project) }
}