import { Entity } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { ReqType } from "./ReqType.js";

/**
 * A result desired by an organization
 */
@Entity({ discriminatorValue: ReqType.OUTCOME })
export class Outcome extends Goal {
    static override req_type: ReqType = ReqType.OUTCOME;
    // FIXME: The Context and overall objective entry is an Outcome, but the req_id is G.1.0
    static override reqIdPrefix = 'G.3.' as const;

    override get reqId() { return super.reqId as `${typeof Outcome.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}