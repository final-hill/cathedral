import FunctionalRequirement from "../domain/FunctionalRequirement";
import type { Uuid } from "~/domain/Uuid";
import Interactor from "~/application/Interactor";

type In = Pick<FunctionalRequirement, 'id' | 'parentId' | 'solutionId' | 'name' | 'statement'>

export default class FunctionalRequirementInteractor extends Interactor<FunctionalRequirement> {
    async create({ parentId, name, statement, solutionId }: Omit<In, 'id'>): Promise<Uuid> {
        return await this.repository.add(new FunctionalRequirement({
            id: crypto.randomUUID(),
            property: '',
            parentId,
            solutionId,
            name,
            statement
        }))
    }

    async delete(id: Uuid): Promise<void> {
        await this.repository.delete(id)
    }

    async getAll(solutionId: Uuid): Promise<FunctionalRequirement[]> {
        return await this.repository.getAll(
            behavior => behavior.solutionId === solutionId
        )
    }

    async getByParentId(parentId: Uuid): Promise<FunctionalRequirement[]> {
        return await this.repository.getAll(
            behavior => behavior.parentId === parentId
        )
    }

    async update({ id, parentId, solutionId, name, statement }: In): Promise<void> {
        await this.repository.update(new FunctionalRequirement({
            id,
            solutionId,
            property: '',
            parentId,
            name,
            statement
        }))
    }
}