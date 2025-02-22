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
export class UserStory extends Scenario {
    static override readonly reqIdPrefix = 'S.4.' as const;

    constructor({ functionalBehaviorId, ...rest }: ConstructorParameters<typeof Scenario>[0] & Pick<UserStory, 'functionalBehaviorId'>) {
        super(rest);
        this.functionalBehaviorId = functionalBehaviorId;
    }

    override get reqId() { return super.reqId as `${typeof UserStory.reqIdPrefix}${number}` | undefined; }

    /**
     * The action that the user wants to perform.
     */
    readonly functionalBehaviorId: string

    override toJSON() {
        return {
            ...super.toJSON(),
            functionalBehaviorId: this.functionalBehaviorId
        }
    }
}