import { v7 as uuidv7 } from 'uuid';
import { type Properties } from '../Properties.js';
import { Organization } from './index.js';
import slugify from '../../../utils/slugify.js';
import { Collection } from '@mikro-orm/core';
import {
    type Assumption, type Constraint, type Effect, type Justification, type EnvironmentComponent,
    type FunctionalBehavior, type GlossaryTerm, type Invariant, type Limit, type NonFunctionalBehavior,
    type Obstacle, type Outcome, type Person, type Stakeholder, type SystemComponent, type UseCase,
    type UserStory
} from '../requirements/index.js';

type CollectionToArrayProps<T> = {
    [P in keyof T]: T[P] extends Collection<infer U> ? U[] : T[P];
};

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
export class Solution {
    constructor(properties: Omit<Properties<CollectionToArrayProps<Solution>>, 'slug' | 'id'>) {
        this.id = uuidv7();
        this.description = properties.description;
        this.name = properties.name
        this.organization = properties.organization;
        this.slug = slugify(this.name);

        //for each array property, assign to the corresponding collection property
        for (const key in properties) {
            const xs = Reflect.get(properties, key) as any[];
            if (Array.isArray(xs)) {
                const collection = Reflect.get(this, key) as Collection<any>;
                xs.forEach(x => collection.add(x));
            }
        }
    }

    /**
     * The unique identifier of the Solution
     */
    id: string

    /**
     * The Organization that owns this Solution
     */
    organization: Organization

    /**
     * The description of the Solution
     */
    description: string

    /**
     * The name of the Solution
     */
    name: string

    /**
     * A slugified version of the name
     */
    slug: string

    /**
     * The assumptions for this solution
     */
    assumptions = new Collection<Assumption>(this);

    /**
     * The constraints for this solution
     */
    constraints = new Collection<Constraint>(this);

    /**
     * The effects for this solution
     */
    effects = new Collection<Effect>(this);

    /**
     * The environment components for this solution
     */
    environmentComponents = new Collection<EnvironmentComponent>(this);

    /**
     * The functional behaviors for this solution
     */
    functionalBehaviors = new Collection<FunctionalBehavior>(this);

    /**
     * The glossary terms for this solution
     */
    glossaryTerms = new Collection<GlossaryTerm>(this);

    /**
     * The invariants for this solution
     */
    invariants = new Collection<Invariant>(this);

    /**
     * The justifications for this solution
     */
    justifications = new Collection<Justification>(this);

    /**
     * The limits for this solution
     */
    limits = new Collection<Limit>(this);

    /**
     * The non-functional behaviors for this solution
     */
    nonFunctionalBehaviors = new Collection<NonFunctionalBehavior>(this);

    /**
     * The obstacles for this solution
     */
    obstacles = new Collection<Obstacle>(this);

    /**
     * The outcomes for this solution
     */
    outcomes = new Collection<Outcome>(this);

    /**
     * The persons for this solution
     */
    persons = new Collection<Person>(this);

    /**
     * The stakeholders for this solution
     */
    stakeholders = new Collection<Stakeholder>(this);

    /**
     * The system components for this solution
     */
    systemComponents = new Collection<SystemComponent>(this);

    /**
     * The use cases for this solution
     */
    useCases = new Collection<UseCase>(this);

    /**
     * The user stories for this solution
     */
    userStories = new Collection<UserStory>(this);

    toJSON() {
        return {
            id: this.id,
            description: this.description,
            name: this.name,
            slug: this.slug,
            organizationId: this.organization
        }
    }
}