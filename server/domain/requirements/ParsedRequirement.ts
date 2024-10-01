import { Collection } from '@mikro-orm/core';
import { type CollectionToArrayProps } from '../types/index.js';
import {
    type Assumption, type Constraint, type Effect, type Justification, type EnvironmentComponent,
    type FunctionalBehavior, type GlossaryTerm, type Invariant, type Limit, MetaRequirement,
    type NonFunctionalBehavior, type Obstacle, type Outcome, type Person, type Stakeholder,
    type SystemComponent, type UseCase, type UserStory
} from '../requirements/index.js';

/**
 * A requirement that has been parsed from natural language text
 */
export class ParsedRequirement extends MetaRequirement {
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

    assumptions = new Collection<Assumption>(this);
    constraints = new Collection<Constraint>(this);
    effects = new Collection<Effect>(this);
    environmentComponents = new Collection<EnvironmentComponent>(this);
    functionalBehaviors = new Collection<FunctionalBehavior>(this);
    glossaryTerms = new Collection<GlossaryTerm>(this);
    invariants = new Collection<Invariant>(this);
    justifications = new Collection<Justification>(this);
    limits = new Collection<Limit>(this);
    nonFunctionalBehaviors = new Collection<NonFunctionalBehavior>(this);
    obstacles = new Collection<Obstacle>(this);
    outcomes = new Collection<Outcome>(this);
    persons = new Collection<Person>(this);
    stakeholders = new Collection<Stakeholder>(this);
    systemComponents = new Collection<SystemComponent>(this);
    useCases = new Collection<UseCase>(this);
    userStories = new Collection<UserStory>(this);
}