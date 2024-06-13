import type Repository from "~/application/Repository";
import NonFunctionalRequirement from "../domain/NonFunctionalRequirement";
import type { Uuid } from "~/domain/Uuid";

export default class NonFunctionalRequirementInteractor {
    constructor(
        readonly repository: Repository<NonFunctionalRequirement>
    ) { }

    async create({ parentId, name, statement }: Pick<NonFunctionalRequirement, 'parentId' | 'name' | 'statement'>): Promise<Uuid> {
        return await this.repository.add(new NonFunctionalRequirement({
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

    async getAll(parentId: Uuid): Promise<NonFunctionalRequirement[]> {
        return await this.repository.getAll(
            behavior => behavior.parentId === parentId
        )
    }

    async update({ id, parentId, name, statement }: Pick<NonFunctionalRequirement, 'id' | 'parentId' | 'name' | 'statement'>): Promise<void> {
        await this.repository.update(new NonFunctionalRequirement({
            id,
            property: '',
            parentId,
            name,
            statement
        }))
    }
}