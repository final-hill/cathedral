import { Goals } from "domain/Goals.mjs";
import { LocalStorageRepository } from "./LocalStorageRepository.mjs";

export class GoalsRepository extends LocalStorageRepository<Goals> {
    constructor() { super('goals', Goals) }

    async getBySlug(slug: string): Promise<Goals | undefined> {
        const all = await this.getAll(),
            found = all.find(e => e.slug() === slug)

        return found
    }
}