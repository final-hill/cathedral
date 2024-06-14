import NonFunctionalRequirement from "../domain/NonFunctionalRequirement";
import type { Uuid } from "~/domain/Uuid";
import Interactor from "~/application/Interactor";

type In = Pick<NonFunctionalRequirement, 'id' | 'parentId' | 'solutionId' | 'name' | 'statement'>

export default class NonFunctionalRequirementInteractor extends Interactor<NonFunctionalRequirement> {
    async create({ parentId, name, statement, solutionId }: Omit<In, 'id'>): Promise<Uuid> {
        return await this.repository.add(new NonFunctionalRequirement({
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

    async getAll(solutionId: Uuid): Promise<NonFunctionalRequirement[]> {
        return await this.repository.getAll(
            behavior => behavior.solutionId === solutionId
        )
    }

    async getByParentId(parentId: Uuid): Promise<NonFunctionalRequirement[]> {
        return await this.repository.getAll(
            behavior => behavior.parentId === parentId
        )
    }

    async update({ id, parentId, name, statement, solutionId }: In): Promise<void> {
        await this.repository.update(new NonFunctionalRequirement({
            id,
            property: '',
            parentId,
            name,
            statement,
            solutionId
        }))
    }
}