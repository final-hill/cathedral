import { EntitySchema } from "@mikro-orm/core";
import MetaRequirementSchema from "./MetaRequirementSchema.js";
import {
    Assumption, Constraint, Effect, EnvironmentComponent, FunctionalBehavior, GlossaryTerm,
    Invariant, Justification, Limit, MetaRequirement, NonFunctionalBehavior, Obstacle, Outcome,
    ParsedRequirement, Person, Stakeholder, SystemComponent, UseCase, UserStory
} from "../../../domain/requirements/index.js";

export default new EntitySchema<ParsedRequirement, MetaRequirement>({
    class: ParsedRequirement,
    extends: MetaRequirementSchema,
    properties: {
        assumptions: { kind: '1:m', entity: () => Assumption, mappedBy: (e) => e.follows },
        constraints: { kind: '1:m', entity: () => Constraint, mappedBy: (e) => e.follows },
        effects: { kind: '1:m', entity: () => Effect, mappedBy: (e) => e.follows },
        environmentComponents: { kind: '1:m', entity: () => EnvironmentComponent, mappedBy: (e) => e.follows },
        functionalBehaviors: { kind: '1:m', entity: () => FunctionalBehavior, mappedBy: (e) => e.follows },
        glossaryTerms: { kind: '1:m', entity: () => GlossaryTerm, mappedBy: (e) => e.follows },
        invariants: { kind: '1:m', entity: () => Invariant, mappedBy: (e) => e.follows },
        justifications: { kind: '1:m', entity: () => Justification, mappedBy: (e) => e.follows },
        limits: { kind: '1:m', entity: () => Limit, mappedBy: (e) => e.follows },
        nonFunctionalBehaviors: { kind: '1:m', entity: () => NonFunctionalBehavior, mappedBy: (e) => e.follows },
        obstacles: { kind: '1:m', entity: () => Obstacle, mappedBy: (e) => e.follows },
        outcomes: { kind: '1:m', entity: () => Outcome, mappedBy: (e) => e.follows },
        persons: { kind: '1:m', entity: () => Person, mappedBy: (e) => e.follows },
        stakeholders: { kind: '1:m', entity: () => Stakeholder, mappedBy: (e) => e.follows },
        systemComponents: { kind: '1:m', entity: () => SystemComponent, mappedBy: (e) => e.follows },
        useCases: { kind: '1:m', entity: () => UseCase, mappedBy: (e) => e.follows },
        userStories: { kind: '1:m', entity: () => UserStory, mappedBy: (e) => e.follows }
    }
})