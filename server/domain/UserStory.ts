import { Entity, ManyToOne } from "@mikro-orm/core";
import { FunctionalBehavior } from "./FunctionalBehavior.js";
import { Outcome } from "./Outcome.js";
import { ParsedRequirement } from "./ParsedRequirement.js";
import { Scenario } from "./Scenario.js";

/**
 * A User Story specifies the handling of a specific user need.
 *
 * As a [role], I want [behavior], so that [goal].
 *
 * [role] - primary_actor_id (Actor)
 * [behavior] - behaviorId (Functional Behavior)
 * [goal] - outcomeId
 */
@Entity()
export class UserStory extends Scenario {
    constructor({ outcome, functionalBehavior, follows, ...rest }: Omit<UserStory, 'id'>) {
        super(rest);
        this.outcome = outcome;
        this.functionalBehavior = functionalBehavior;
        this.follows = follows;
    }

    /**
     * Requirement that this user story follows from
     */
    @ManyToOne({ entity: () => ParsedRequirement })
    follows?: ParsedRequirement;

    /**
     * The action that the user wants to perform.
     */
    @ManyToOne({ entity: () => FunctionalBehavior })
    functionalBehavior?: FunctionalBehavior;

    /**
     * The outcome that the story is aiming to achieve.
     */
    @ManyToOne({ entity: () => Outcome })
    outcome?: Outcome;
}