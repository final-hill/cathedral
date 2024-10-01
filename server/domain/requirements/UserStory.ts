import { FunctionalBehavior, Outcome, Scenario } from "./index.js";

/**
 * A User Story specifies the handling of a specific user need.
 *
 * As a [role], I want [behavior], so that [goal].
 *
 * [role] - primary_actor_id (Actor)
 * [behavior] - behaviorId (Functional Behavior)
 * [goal] - outcomeId
 */
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
    follows?: UserStory;

    /**
     * The action that the user wants to perform.
     */
    functionalBehavior?: FunctionalBehavior;

    /**
     * The outcome that the story is aiming to achieve.
     */
    outcome?: Outcome;
}
