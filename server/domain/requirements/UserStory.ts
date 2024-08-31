import type { Properties } from "../Properties.js";
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
    constructor({ outcome, functionalBehavior, ...rest }: Omit<Properties<UserStory>, 'id'>) {
        super(rest);
        this.outcome = outcome;
        this.functionalBehavior = functionalBehavior;
    }

    /**
     * The action that the user wants to perform.
     */
    functionalBehavior: FunctionalBehavior

    /**
     * The outcome that the story is aiming to achieve.
     */
    outcome: Outcome

    override toJSON() {
        return {
            ...super.toJSON(),
            functionalBehaviorId: this.functionalBehavior.id,
            outcomeId: this.outcome.id
        }
    }
}