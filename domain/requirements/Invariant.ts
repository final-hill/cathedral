import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
@Entity({ discriminatorValue: ReqType.INVARIANT })
export class Invariant extends Requirement {
    static override reqIdPrefix = 'E.6.' as const;

    constructor(props: Properties<Omit<Invariant, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.INVARIANT;
    }

    override get reqId() { return super.reqId as `${typeof Invariant.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}