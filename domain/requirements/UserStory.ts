import { Entity, ManyToOne } from "@mikro-orm/core";
import { FunctionalBehavior } from "./FunctionalBehavior.js";
import { Scenario } from "./Scenario.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const userStoryReqIdPrefix = 'S.4.' as const;
export type UserStoryReqId = `${typeof userStoryReqIdPrefix}${number}`;

/**
 * A User Story specifies the handling of a specific user need.
 *
 * As a [role], I want [behavior], so that [goal].
 *
 * [role] - primary_actor_id (Actor)
 * [behavior] - behaviorId (Functional Behavior)
 * [goal] - outcomeId
 */
@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStory extends Scenario {
    constructor(props: Properties<Omit<UserStory, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.USER_STORY;
        this.functionalBehavior = props.functionalBehavior;
    }

    override get reqId(): UserStoryReqId | undefined { return super.reqId as UserStoryReqId | undefined }
    override set reqId(value: UserStoryReqId | undefined) { super.reqId = value }

    /**
     * The action that the user wants to perform.
     */
    @ManyToOne({ entity: () => FunctionalBehavior })
    functionalBehavior?: FunctionalBehavior;
}