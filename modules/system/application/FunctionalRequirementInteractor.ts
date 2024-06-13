import type Repository from "~/application/Repository";
import FunctionalRequirement from "../domain/FunctionalRequirement";
import type { Uuid } from "~/domain/Uuid";

export default class FunctionalRequirementInteractor {
    constructor(
        readonly repository: Repository<FunctionalRequirement>
    ) { }

    async create({ parentId, name, statement }: Pick<FunctionalRequirement, 'parentId' | 'name' | 'statement'>): Promise<Uuid> {
        return await this.repository.add(new FunctionalRequirement({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            name,
            statement
        }))
    }

    async delete(id: Uuid): Promise<void> {
        await this.repository.delete(id)
    }

    async getAll(parentId: Uuid): Promise<FunctionalRequirement[]> {
        return await this.repository.getAll(
            behavior => behavior.parentId === parentId
        )
    }

    async update({ id, parentId, name, statement }: Pick<FunctionalRequirement, 'id' | 'parentId' | 'name' | 'statement'>): Promise<void> {
        await this.repository.update(new FunctionalRequirement({
            id,
            property: '',
            parentId,
            name,
            statement
        }))
    }
}