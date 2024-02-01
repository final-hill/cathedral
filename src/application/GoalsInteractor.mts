import Goals from '~/domain/Goals.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';
import Behavior from '~/domain/Behavior.mjs';
import type { Properties } from '~/types/Properties.mjs';
import Limit from '~/domain/Limit.mjs';
import Stakeholder from '~/domain/Stakeholder.mjs';
import UseCase from '~/domain/UseCase.mjs';

export default class GoalsInteractor extends Interactor<Goals> {
    constructor({ presenter, repository }: {
        presenter: Presenter<Goals>;
        repository: Repository<Goals>;
    }) {
        super({ presenter, repository, Entity: Goals });
    }

    async createBehavior({ goalsId, statement }: {
        goalsId: Uuid;
        statement: string;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.functionalBehaviors.push(new Behavior({
            id: crypto.randomUUID(),
            statement
        }));
        await this.repository.update(goals);
    }

    async createLimit({ goalsId, statement }: {
        goalsId: Uuid;
        statement: string;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.limits.push(new Limit({
            id: crypto.randomUUID(),
            statement
        }));
        await this.repository.update(goals);
    }

    async createStakeholder({ goalsId, stakeholder }: {
        goalsId: Uuid;
        stakeholder: Omit<Properties<Stakeholder>, 'id'>;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.stakeholders.push(new Stakeholder({
            ...stakeholder,
            id: crypto.randomUUID()
        }));
        await this.repository.update(goals);
    }

    async createUseCase({ goalsId, actorId, statement }: {
        goalsId: Uuid;
        actorId: Uuid;
        statement: string;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.useCases.push(new UseCase({
            id: crypto.randomUUID(),
            actor: goals.stakeholders.find(s => s.id === actorId)!,
            statement
        }));
        await this.repository.update(goals);
    }

    async deleteBehavior({ goalsId, id }: {
        goalsId: Uuid;
        id: Uuid;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.functionalBehaviors = goals.functionalBehaviors.filter(b => b.id !== id);
        await this.repository.update(goals);
    }

    async deleteLimit({ goalsId, id }: {
        goalsId: Uuid;
        id: Uuid;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.limits = goals.limits.filter(b => b.id !== id);
        await this.repository.update(goals);
    }

    async deleteStakeholder({ goalsId, id }: {
        goalsId: Uuid;
        id: Uuid;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.stakeholders = goals.stakeholders.filter(b => b.id !== id);
        await this.repository.update(goals);
    }

    async deleteUseCase({ goalsId, id }: {
        goalsId: Uuid;
        id: Uuid;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.useCases = goals.useCases.filter(b => b.id !== id);
        await this.repository.update(goals);
    }

    async updateBehavior({ goalsId, behavior }: {
        goalsId: Uuid;
        behavior: Properties<Behavior>;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.functionalBehaviors = goals.functionalBehaviors.map(
            b => b.id === behavior.id ? new Behavior(behavior) : b
        );

        await this.repository.update(goals);
    }

    async updateLimit({ goalsId, limit }: {
        goalsId: Uuid;
        limit: Properties<Limit>;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.limits = goals.limits.map(
            b => b.id === limit.id ? new Limit(limit) : b
        );

        await this.repository.update(goals);
    }

    async updateStakeholder({ goalsId, stakeholder }: {
        goalsId: Uuid;
        stakeholder: Properties<Stakeholder>;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.stakeholders = goals.stakeholders.map(
            s => s.id === stakeholder.id ? new Stakeholder(stakeholder) : s
        );

        await this.repository.update(goals);
    }

    async updateUseCase({ goalsId, id, actorId, statement }: {
        goalsId: Uuid;
        id: Uuid;
        actorId: Uuid;
        statement: string;
    }) {
        const goals = await this.repository.get(goalsId);

        if (!goals)
            throw new Error(`Goals ${goalsId} not found`);

        goals.useCases = goals.useCases.map(
            b => b.id === id ? new UseCase({
                id: b.id,
                actor: goals.stakeholders.find(s => s.id === actorId)!,
                statement
            }) : b
        );

        await this.repository.update(goals);
    }
}