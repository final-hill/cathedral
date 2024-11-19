import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

export type AssumptionReqId = `${typeof Assumption.reqIdPrefix}${number}`;

/**
 * Posited property of the environment
 */
@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class Assumption extends Requirement {
    static override reqIdPrefix = 'E.4.' as const;
    static override req_type = ReqType.ASSUMPTION;

    override get reqId() { return super.reqId as `${typeof Assumption.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}