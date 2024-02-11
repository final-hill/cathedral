import type { Properties } from '~/types/Properties.mjs';
import { Assumption, Component, Constraint, ConstraintCategory, Effect, Environment, GlossaryTerm, Invariant, type Uuid } from '~/domain/index.mjs';
import Interactor from './Interactor.mjs';
import type Presenter from './Presenter.mjs';
import type Repository from './Repository.mjs';
import treeFind from '~/lib/treeFind.mjs';

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
        { environmentId, parentId, label }: {
            environmentId: Uuid;
            parentId?: Uuid;
            label: string;
        }
    ): Promise<Component> {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        const parent = !parentId ? environment :
            environment.components.map(c => treeFind(parentId, c))
                .find(x => x) ?? environment,
            component = new Component({
                id: crypto.randomUUID(),
                name: label,
                statement: '',
                children: []
            });

        if (parent instanceof Environment)
            environment.components.push(component);
        else
            parent.children.push(component);

        await this.repository.update(environment);

        return component;
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
        { environmentId, id, parentId }: { environmentId: Uuid; id: Uuid; parentId?: Uuid }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        const parent = !parentId ? environment :
            environment.components.map(c => treeFind(parentId, c))
                .find(x => x) ?? environment;

        if (parent instanceof Environment)
            environment.components = environment.components.filter(x => x.id !== id);
        else
            parent.children = parent.children.filter(x => x.id !== id);

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
        { environmentId, id, parentId, label }:
            { environmentId: Uuid; id: Uuid; parentId?: Uuid; label: string }
    ) {
        const environment = await this.repository.get(environmentId);

        if (!environment)
            throw new Error(`Environment ${environmentId} not found`);

        const parent = !parentId ? environment :
            environment.components.map(c => treeFind(parentId, c))
                .find(x => x) ?? environment;

        if (parent instanceof Environment)
            parent.components = environment.components.map(c =>
                c.id === id ? new Component({
                    id,
                    name: label,
                    statement: '',
                    children: c.children
                }) : c
            );
        else
            parent.children = parent.children.map(c =>
                c.id === id ? new Component({
                    id,
                    name: label,
                    statement: '',
                    children: c.children
                }) : c
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