import type { Uuid } from "~/domain/Uuid";
import Scenario from "./Scenario";
import type { Properties } from "~/domain/Properties";

/**
 * A User Story specifies the handling of a specific user need.
 *
 * As a [role], I want [behavior], so that [goal].
 *
 * [role] - primaryActorId
 * [behavior] - behaviorId (Functional Behavior)
 * [goal] - outcomeId
 */
export default class UserStory extends Scenario {
    constructor({ outcomeId, functionalBehaviorId, ...rest }: Properties<UserStory>) {
        super(rest);
        this.outcomeId = outcomeId;
        this.functionalBehaviorId = functionalBehaviorId;
    }

    /**
     * The action that the user wants to perform.
     */
    functionalBehaviorId: Uuid

    /**
     * The outcome that the story is aiming to achieve.
     */
    outcomeId: Uuid
}