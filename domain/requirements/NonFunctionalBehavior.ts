import { Entity } from "@mikro-orm/core";
import { Functionality } from "./Functionality.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
 * It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
 * Generally expressed in the form "system shall be <requirement>."
 */
@Entity({ discriminatorValue: ReqType.NON_FUNCTIONAL_BEHAVIOR })
export class NonFunctionalBehavior extends Functionality {
    static override reqIdPrefix = 'S.2.' as const;

    constructor(props: Properties<Omit<NonFunctionalBehavior, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.NON_FUNCTIONAL_BEHAVIOR;
    }

    override get reqId() { return super.reqId as `${typeof NonFunctionalBehavior.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}