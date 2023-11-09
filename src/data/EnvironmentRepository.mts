import { Environment } from "domain/Environment.mjs";
import { LocalStorageRepository } from "./LocalStorageRepository.mjs";

export class EnvironmentRepository extends LocalStorageRepository<Environment> {
    constructor() { super('environments', Environment) }

    async getBySlug(slug: string): Promise<Environment | undefined> {
        const all = await this.getAll(),
            found = all.find(e => e.slug() === slug)

        return found
    }
}