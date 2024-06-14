import Interactor from "~/application/Interactor"
import Epic from "../domain/Epic"
import type { Uuid } from "~/domain/Uuid"

type In = Pick<Epic, 'id' | 'parentId' | 'solutionId' | 'name' | 'statement' | 'primaryActorId'>;

export default class EpicInteractor extends Interactor<Epic> {
    async create({ parentId, solutionId, name, statement, primaryActorId }: Omit<In, 'id'>): Promise<Uuid> {
        return await this.repository.add(new Epic({
            id: crypto.randomUUID(),
            primaryActorId,
            solutionId,
            parentId,
            name,
            statement,
            property: ''
        }))
    }

    async delete(id: Uuid): Promise<void> {
        await this.repository.delete(id)
    }

    async getAll(solutionId: Uuid): Promise<Epic[]> {
        return await this.repository.getAll(
            behavior => behavior.solutionId === solutionId
        )
    }

    async getByParentId(parentId: Uuid): Promise<Epic[]> {
        return await this.repository.getAll(
            behavior => behavior.parentId === parentId
        )
    }

    async update({ id, name, statement, solutionId, parentId, primaryActorId }: In): Promise<void> {
        await this.repository.update(new Epic({
            id,
            name,
            statement,
            solutionId,
            parentId,
            primaryActorId,
            property: ''
        }))
    }
}