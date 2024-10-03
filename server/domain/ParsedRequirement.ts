import { Collection, Entity, OneToMany } from '@mikro-orm/core';
import { type CollectionToArrayProps } from './types/index.js';
import {
    Assumption, Constraint, Effect, EnvironmentComponent,
    FunctionalBehavior, GlossaryTerm, Invariant, Justification, Limit, MetaRequirement,
    NonFunctionalBehavior, Obstacle, Outcome, Person, Stakeholder,
    SystemComponent, UseCase, UserStory
} from './index.js';

/**
 * A requirement that has been parsed from natural language text
 */
@Entity()
class ParsedRequirement extends MetaRequirement {
    constructor(properties: Omit<CollectionToArrayProps<ParsedRequirement>, 'id'>) {
        super(properties);

        // For each array property, assign to the corresponding collection property
        for (const key in properties) {
            const xs = Reflect.get(properties, key) as any[];
            if (Array.isArray(xs)) {
                const collection = Reflect.get(this, key) as Collection<any>;
                xs.forEach(x => collection.add(x));
            }
        }
    }

    @OneToMany({ entity: () => Assumption, mappedBy: 'follows' })
    assumptions = new Collection<Assumption>(this);

    @OneToMany({ entity: () => Constraint, mappedBy: 'follows' })
    constraints = new Collection<Constraint>(this);

    @OneToMany({ entity: () => Effect, mappedBy: 'follows' })
    effects = new Collection<Effect>(this);

    @OneToMany({ entity: () => EnvironmentComponent, mappedBy: 'follows' })
    environmentComponents = new Collection<EnvironmentComponent>(this);

    @OneToMany({ entity: () => FunctionalBehavior, mappedBy: 'follows' })
    functionalBehaviors = new Collection<FunctionalBehavior>(this);

    @OneToMany({ entity: () => GlossaryTerm, mappedBy: 'follows' })
    glossaryTerms = new Collection<GlossaryTerm>(this);

    @OneToMany({ entity: () => Invariant, mappedBy: 'follows' })
    invariants = new Collection<Invariant>(this);

    @OneToMany({ entity: () => Justification, mappedBy: 'follows' })
    justifications = new Collection<Justification>(this);

    @OneToMany({ entity: () => Limit, mappedBy: 'follows' })
    limits = new Collection<Limit>(this);

    @OneToMany({ entity: () => NonFunctionalBehavior, mappedBy: 'follows' })
    nonFunctionalBehaviors = new Collection<NonFunctionalBehavior>(this);

    @OneToMany({ entity: () => Obstacle, mappedBy: 'follows' })
    obstacles = new Collection<Obstacle>(this);

    @OneToMany({ entity: () => Outcome, mappedBy: 'follows' })
    outcomes = new Collection<Outcome>(this);

    @OneToMany({ entity: () => Person, mappedBy: 'follows' })
    persons = new Collection<Person>(this);

    @OneToMany({ entity: () => Stakeholder, mappedBy: 'follows' })
    stakeholders = new Collection<Stakeholder>(this);

    @OneToMany({ entity: () => SystemComponent, mappedBy: 'follows' })
    systemComponents = new Collection<SystemComponent>(this);

    @OneToMany({ entity: () => UseCase, mappedBy: 'follows' })
    useCases = new Collection<UseCase>(this);

    @OneToMany({ entity: () => UserStory, mappedBy: 'follows' })
    userStories = new Collection<UserStory>(this);
}

export { ParsedRequirement };