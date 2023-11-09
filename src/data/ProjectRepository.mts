import { Project } from "domain/Project.mjs";
import { LocalStorageRepository } from "./LocalStorageRepository.mjs";

export class ProjectRepository extends LocalStorageRepository<Project> {
    constructor() { super('projects', Project) }

    async getBySlug(slug: string): Promise<Project | undefined> {
        const all = await this.getAll(),
            found = all.find(e => e.slug() === slug)

        return found
    }
}