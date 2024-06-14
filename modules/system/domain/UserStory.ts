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
 * [goal] - epicId
 */
export default class UserStory extends Scenario {
    constructor({ epicId, behaviorId, ...rest }: Properties<UserStory>) {
        super(rest);
        this.epicId = epicId;
        this.behaviorId = behaviorId;
    }

    behaviorId: Uuid

    /**
     * The epic (goal / purpose) that the story is aiming to achieve. 
     */
    epicId: Uuid
}