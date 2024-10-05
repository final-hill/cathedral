import { v7 as uuidv7 } from 'uuid';
import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { type CollectionToArrayProps } from './types/index.js';
import slugify from '../../utils/slugify.js';
import {
    Assumption, Constraint, Effect, EnvironmentComponent, FunctionalBehavior, GlossaryTerm, Invariant, Justification,
    Limit, NonFunctionalBehavior, Obstacle, Organization, Outcome, Person, Stakeholder, SystemComponent, UseCase, UserStory
} from './index.js';

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
@Entity()
class Solution {
    constructor(properties: Omit<CollectionToArrayProps<Solution>, 'slug' | 'id'>) {
        this.id = uuidv7();
        this.description = properties.description;
        this.name = properties.name;
        this.organization = properties.organization;
        this.slug = slugify(this.name);

        // For each array property, assign to the corresponding collection property
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
    @Property({ type: 'uuid', primary: true })
    id: string;

    /**
     * The Organization that owns this Solution
     */
    @ManyToOne({ entity: () => Organization, inversedBy: 'solutions' })
    organization: Organization;

    /**
     * The description of the Solution
     */
    @Property({ type: 'string' })
    description: string;

    /**
     * The name of the Solution
     * @throws {Error} if the name is longer than 100 characters
     */
    @Property({ type: 'string', length: 100 })
    name: string;

    /**
     * A slugified version of the name
     */
    @Property({ type: 'string', unique: true })
    slug: string;

    /**
     * The assumptions for this solution
     */
    @OneToMany({ entity: () => Assumption, mappedBy: 'solution', orphanRemoval: true })
    assumptions = new Collection<Assumption>(this);

    /**
     * The constraints for this solution
     */
    @OneToMany({ entity: () => Constraint, mappedBy: 'solution', orphanRemoval: true })
    constraints = new Collection<Constraint>(this);

    /**
     * The effects for this solution
     */
    @OneToMany({ entity: () => Effect, mappedBy: 'solution', orphanRemoval: true })
    effects = new Collection<Effect>(this);

    /**
     * The environment components for this solution
     */
    @OneToMany({ entity: () => EnvironmentComponent, mappedBy: 'solution', orphanRemoval: true })
    environmentComponents = new Collection<EnvironmentComponent>(this);

    /**
     * The functional behaviors for this solution
     */
    @OneToMany({ entity: () => FunctionalBehavior, mappedBy: 'solution', orphanRemoval: true })
    functionalBehaviors = new Collection<FunctionalBehavior>(this);

    /**
     * The glossary terms for this solution
     */
    @OneToMany({ entity: () => GlossaryTerm, mappedBy: 'solution', orphanRemoval: true })
    glossaryTerms = new Collection<GlossaryTerm>(this);

    /**
     * The invariants for this solution
     */
    @OneToMany({ entity: () => Invariant, mappedBy: 'solution', orphanRemoval: true })
    invariants = new Collection<Invariant>(this);

    /**
     * The justifications for this solution
     */
    @OneToMany({ entity: () => Justification, mappedBy: 'solution', orphanRemoval: true })
    justifications = new Collection<Justification>(this);

    /**
     * The limits for this solution
     */
    @OneToMany({ entity: () => Limit, mappedBy: 'solution', orphanRemoval: true })
    limits = new Collection<Limit>(this);

    /**
     * The non-functional behaviors for this solution
     */
    @OneToMany({ entity: () => NonFunctionalBehavior, mappedBy: 'solution', orphanRemoval: true })
    nonFunctionalBehaviors = new Collection<NonFunctionalBehavior>(this);

    /**
     * The obstacles for this solution
     */
    @OneToMany({ entity: () => Obstacle, mappedBy: 'solution', orphanRemoval: true })
    obstacles = new Collection<Obstacle>(this);

    /**
     * The outcomes for this solution
     */
    @OneToMany({ entity: () => Outcome, mappedBy: 'solution', orphanRemoval: true })
    outcomes = new Collection<Outcome>(this);

    /**
     * The persons for this solution
     */
    @OneToMany({ entity: () => Person, mappedBy: 'solution', orphanRemoval: true })
    persons = new Collection<Person>(this);

    /**
     * The stakeholders for this solution
     */
    @OneToMany({ entity: () => Stakeholder, mappedBy: 'solution', orphanRemoval: true })
    stakeholders = new Collection<Stakeholder>(this);

    /**
     * The system components for this solution
     */
    @OneToMany({ entity: () => SystemComponent, mappedBy: 'solution', orphanRemoval: true })
    systemComponents = new Collection<SystemComponent>(this);

    /**
     * The use cases for this solution
     */
    @OneToMany({ entity: () => UseCase, mappedBy: 'solution', orphanRemoval: true })
    useCases = new Collection<UseCase>(this);

    /**
     * The user stories for this solution
     */
    @OneToMany({ entity: () => UserStory, mappedBy: 'solution', orphanRemoval: true })
    userStories = new Collection<UserStory>(this);
}

export { Solution };