import Interactor from "~/application/Interactor"
import UseCase from "../domain/UseCase"
import type { Uuid } from "~/domain/Uuid"

type In = Pick<UseCase, 'id' | 'name' | 'primaryActorId' | 'parentId' | 'extensions' | 'goalInContext' | 'level' | 'mainSuccessScenario' | 'preCondition' | 'scope' | 'stakeHoldersAndInterests' | 'successGuarantee' | 'trigger' | 'solutionId'>

export default class UseCaseInteractor extends Interactor<UseCase> {
    async create(
        props: Omit<In, 'id'>
    ): Promise<Uuid> {
        return await this.repository.add(new UseCase({
            id: crypto.randomUUID(),
            extensions: props.extensions,
            goalInContext: props.goalInContext,
            level: props.level,
            mainSuccessScenario: props.mainSuccessScenario,
            name: props.name,
            parentId: props.parentId,
            preCondition: props.preCondition,
            primaryActorId: props.primaryActorId,
            property: '',
            scope: props.scope,
            solutionId: props.solutionId,
            stakeHoldersAndInterests: props.stakeHoldersAndInterests,
            successGuarantee: props.successGuarantee,
            statement: '',
            trigger: props.trigger
        }))
    }

    async delete(id: Uuid): Promise<void> {
        await this.repository.delete(id)
    }

    async getAll(solutionId: Uuid): Promise<UseCase[]> {
        return await this.repository.getAll(
            useCase => useCase.solutionId === solutionId
        )
    }

    async update(props: In): Promise<void> {
        await this.repository.update(new UseCase({
            id: props.id,
            extensions: props.extensions,
            goalInContext: props.goalInContext,
            level: props.level,
            mainSuccessScenario: props.mainSuccessScenario,
            name: props.name,
            parentId: props.parentId,
            preCondition: props.preCondition,
            primaryActorId: props.primaryActorId,
            property: '',
            scope: props.scope,
            solutionId: props.solutionId,
            stakeHoldersAndInterests: props.stakeHoldersAndInterests,
            successGuarantee: props.successGuarantee,
            statement: '',
            trigger: props.trigger
        }))
    }
}