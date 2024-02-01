import Environment from '~/domain/Environment.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';
import type { Uuid } from '~/domain/Uuid.mjs';
import Assumption from '~/domain/Assumption.mjs';
import type { Properties } from '~/types/Properties.mjs';
import Component from '~/domain/Component.mjs';
import Constraint, { ConstraintCategory } from '~/domain/Constraint.mjs';
import Effect from '~/domain/Effect.mjs';
import GlossaryTerm from '~/domain/GlossaryTerm.mjs';
import Invariant from '~/domain/Invariant.mjs';

export default class EnvironmentInteractor extends Interactor<Environment> {
    constructor({ presenter, repository }: {
        presenter: Presenter<Environment>;
        repository: Repository<Environment>;
    }) {
        super({ presenter, repository, Entity: Environment });
    }

    async createAssumption(
        { environmentId, statement }: { environmentId: Uuid; statement: string }
    ) {
        const environment = await this.repository.get(environmentId),
            assumption = new Assumption({
                id: crypto.randomUUID(),
                statement
            });

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.assumptions.push(assumption);
        await this.repository.update(environment);

        return assumption;
    }

    async createComponent(
        { environmentId, name, description, interfaceDefinition }: {
            environmentId: Uuid;
            name: string;
            description: string;
            interfaceDefinition: string;
        }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.components.push(new Component({
            id: crypto.randomUUID(),
            name,
            description,
            statement: interfaceDefinition
        }));

        await this.repository.update(environment);
    }

    async createConstraint(
        { environmentId, statement, category }: {
            environmentId: Uuid;
            statement: string;
            category: ConstraintCategory;
        }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.constraints.push(new Constraint({
            id: crypto.randomUUID(),
            statement,
            category
        }));

        await this.repository.update(environment);
    }

    async createEffect(
        { environmentId, statement }: { environmentId: Uuid; statement: string }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.effects.push(new Effect({
            id: crypto.randomUUID(),
            statement
        }));

        await this.repository.update(environment);
    }

    async createGlossaryTerm(
        { environmentId, term, definition }: {
            environmentId: Uuid;
            term: string;
            definition: string;
        }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.glossaryTerms.push(
            new GlossaryTerm({ id: crypto.randomUUID(), term, definition })
        );

        await this.repository.update(environment);
    }

    async createInvariant(
        { environmentId, statement }: { environmentId: Uuid; statement: string }
    ) {
        const environment = await this.repository.get(environmentId),
            invariant = new Invariant({
                id: crypto.randomUUID(),
                statement
            });

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.invariants.push(invariant);
        await this.repository.update(environment);

        return invariant;
    }

    async deleteAssumption(
        { environmentId, id }: { environmentId: Uuid; id: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.assumptions = environment.assumptions.filter(x => x.id !== id);
        await this.repository.update(environment);
    }

    async deleteComponent(
        { environmentId, id }: { environmentId: Uuid; id: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.components = environment.components.filter(x => x.id !== id);
        await this.repository.update(environment);
    }

    async deleteConstraint(
        { environmentId, id }: { environmentId: Uuid; id: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.constraints = environment.constraints.filter(x => x.id !== id);
        await this.repository.update(environment);
    }

    async deleteEffect(
        { environmentId, id }: { environmentId: Uuid; id: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.effects = environment.effects.filter(x => x.id !== id);
        await this.repository.update(environment);
    }

    async deleteGlossaryTerm(
        { environmentId, id }: { environmentId: Uuid; id: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.glossaryTerms = environment.glossaryTerms.filter(x => x.id !== id);
        await this.repository.update(environment);
    }

    async deleteInvariant(
        { environmentId, id }: { environmentId: Uuid; id: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.invariants = environment.invariants.filter(x => x.id !== id);
        await this.repository.update(environment);
    }

    async updateAssumption(
        { environmentId, assumption }: { environmentId: Uuid; assumption: Properties<Assumption> }
    ) {
        const environment = await this.repository.get(environmentId),
            newAssumption = new Assumption(assumption);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.assumptions = environment.assumptions.map(x =>
            x.id === assumption.id ? newAssumption : x
        );

        await this.repository.update(environment);
    }

    async updateComponent(
        { environmentId, component }: { environmentId: Uuid; component: Properties<Component> }
    ) {
        const environment = await this.repository.get(environmentId),
            newComponent = new Component(component);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.components = environment.components.map(x =>
            x.id === component.id ? newComponent : x
        );

        await this.repository.update(environment);
    }

    async updateConstraint(
        { environmentId, constraint }: { environmentId: Uuid; constraint: Properties<Constraint> }
    ) {
        const environment = await this.repository.get(environmentId),
            newConstraint = new Constraint(constraint);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.constraints = environment.constraints.map(x =>
            x.id === constraint.id ? newConstraint : x
        );

        await this.repository.update(environment);
    }

    async updateEffect(
        { environmentId, effect }: { environmentId: Uuid; effect: Properties<Effect> }
    ) {
        const environment = await this.repository.get(environmentId),
            newEffect = new Effect(effect);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.effects = environment.effects.map(x =>
            x.id === effect.id ? newEffect : x
        );

        await this.repository.update(environment);
    }

    async updateGlossaryTerm(
        { environmentId, glossaryTerm }: { environmentId: Uuid; glossaryTerm: Properties<GlossaryTerm> }
    ) {
        const environment = await this.repository.get(environmentId),
            newGlossaryTerm = new GlossaryTerm(glossaryTerm);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.glossaryTerms = environment.glossaryTerms.map(x =>
            x.id === glossaryTerm.id ? newGlossaryTerm : x
        );

        await this.repository.update(environment);
    }

    async updateInvariant(
        { environmentId, invariant }: { environmentId: Uuid; invariant: Properties<Invariant> }
    ) {
        const environment = await this.repository.get(environmentId),
            newInvariant = new Invariant(invariant);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        environment.invariants = environment.invariants.map(x =>
            x.id === invariant.id ? newInvariant : x
        );

        await this.repository.update(environment);
    }
}