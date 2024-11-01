import { Entity } from "@mikro-orm/core";
import { Functionality } from "./Functionality.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const nonFunctionalBehaviorReqIdPrefix = 'S.2.' as const;
export type NonFunctionalBehaviorReqId = `${typeof nonFunctionalBehaviorReqIdPrefix}${number}`;

/**
 * NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
 * It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
 * Generally expressed in the form "system shall be <requirement>."
 */
@Entity({ discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR })
export class NonFunctionalBehavior extends Functionality {
    constructor(props: Properties<Omit<NonFunctionalBehavior, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.NON_FUNCTIONAL_BEHAVIOR;
    }

    override get reqId(): NonFunctionalBehaviorReqId | undefined { return super.reqId as NonFunctionalBehaviorReqId | undefined }
    override set reqId(value: NonFunctionalBehaviorReqId | undefined) { super.reqId = value }
}