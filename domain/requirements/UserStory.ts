import { FunctionalBehavior } from "./FunctionalBehavior.js";
import { Scenario } from "./Scenario.js";
import { ReqType } from "./ReqType.js";

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
    static override reqIdPrefix = 'S.4.' as const;
    static override req_type = ReqType.USER_STORY;

    constructor({ functionalBehavior, ...rest }: ConstructorParameters<typeof Scenario>[0] & Pick<UserStory, 'functionalBehavior'>) {
        super(rest);
        this.functionalBehavior = functionalBehavior;
    }

    override get reqId() { return super.reqId as `${typeof UserStory.reqIdPrefix}${number}` | undefined; }
    override set reqId(value) { super.reqId = value; }

    private _functionalBehavior!: FunctionalBehavior;

    /**
     * The action that the user wants to perform.
     */
    get functionalBehavior(): FunctionalBehavior { return this._functionalBehavior; }
    set functionalBehavior(value: FunctionalBehavior) { this._functionalBehavior = value; }
}