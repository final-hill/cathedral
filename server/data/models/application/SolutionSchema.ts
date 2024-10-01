import { EntitySchema } from "@mikro-orm/core";
import { Solution, Organization } from "../../../domain/application/index.js";
import {
    Assumption, Constraint, Effect, EnvironmentComponent, FunctionalBehavior,
    GlossaryTerm, Invariant, Justification, Limit, MetaRequirement, NonFunctionalBehavior,
    Obstacle, Outcome, Person, Stakeholder, SystemComponent, UseCase, UserStory
} from "../../../domain/requirements/index.js";

export default new EntitySchema<Solution>({
    class: Solution,
    properties: {
        id: { type: 'uuid', primary: true },
        name: { type: 'string', nullable: false, length: 100 },
        description: { type: 'string', nullable: false },
        slug: { type: 'string', unique: true },
        organization: { kind: 'm:1', entity: () => Organization, inversedBy: 'solutions' },
        assumptions: { kind: '1:m', entity: () => Assumption, mappedBy: 'solution', orphanRemoval: true },
        constraints: { kind: '1:m', entity: () => Constraint, mappedBy: 'solution', orphanRemoval: true },
        effects: { kind: '1:m', entity: () => Effect, mappedBy: 'solution', orphanRemoval: true },
        environmentComponents: { kind: '1:m', entity: () => EnvironmentComponent, mappedBy: 'solution', orphanRemoval: true },
        functionalBehaviors: { kind: '1:m', entity: () => FunctionalBehavior, mappedBy: 'solution', orphanRemoval: true },
        glossaryTerms: { kind: '1:m', entity: () => GlossaryTerm, mappedBy: 'solution', orphanRemoval: true },
        invariants: { kind: '1:m', entity: () => Invariant, mappedBy: 'solution', orphanRemoval: true },
        justifications: { kind: '1:m', entity: () => Justification, mappedBy: 'solution', orphanRemoval: true },
        limits: { kind: '1:m', entity: () => Limit, mappedBy: 'solution', orphanRemoval: true },
        nonFunctionalBehaviors: { kind: '1:m', entity: () => NonFunctionalBehavior, mappedBy: 'solution', orphanRemoval: true },
        obstacles: { kind: '1:m', entity: () => Obstacle, mappedBy: 'solution', orphanRemoval: true },
        outcomes: { kind: '1:m', entity: () => Outcome, mappedBy: 'solution', orphanRemoval: true },
        persons: { kind: '1:m', entity: () => Person, mappedBy: 'solution', orphanRemoval: true },
        stakeholders: { kind: '1:m', entity: () => Stakeholder, mappedBy: 'solution', orphanRemoval: true },
        systemComponents: { kind: '1:m', entity: () => SystemComponent, mappedBy: 'solution', orphanRemoval: true },
        useCases: { kind: '1:m', entity: () => UseCase, mappedBy: 'solution', orphanRemoval: true },
        userStories: { kind: '1:m', entity: () => UserStory, mappedBy: 'solution', orphanRemoval: true }
    }
})