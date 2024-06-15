import Interactor from "~/application/Interactor";
import UserStory from "../domain/UserStory";
import type { Uuid } from "~/domain/Uuid";

type In = Pick<UserStory, 'id' | 'parentId' | 'behaviorId' | 'epicId' | 'primaryActorId' | 'solutionId' | 'name'>

export default class UserStoryInteractor extends Interactor<UserStory> {
    async create(
        { parentId, name, behaviorId, epicId, primaryActorId, solutionId }: Omit<In, 'id'>
    ): Promise<Uuid> {
        return await this.repository.add(new UserStory({
            id: crypto.randomUUID(),
            parentId,
            behaviorId,
            epicId,
            primaryActorId,
            name,
            statement: '',
            property: '',
            solutionId
        }))
    }

    async delete(id: Uuid): Promise<void> {
        await this.repository.delete(id)
    }

    async getAll(parentId: Uuid): Promise<UserStory[]> {
        return await this.repository.getAll(
            behavior => behavior.parentId === parentId
        )
    }

    async update({ id, name, parentId, behaviorId, epicId, primaryActorId, solutionId }: In): Promise<void> {
        await this.repository.update(new UserStory({
            id,
            parentId,
            behaviorId,
            epicId,
            primaryActorId,
            name,
            statement: '',
            property: '',
            solutionId
        }))
    }
}