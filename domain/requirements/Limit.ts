import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * An Exclusion from the scope of requirements
 */
@Entity({ discriminatorValue: ReqType.LIMIT })
export class Limit extends Requirement {
    static override reqIdPrefix = 'G.6.' as const;
    static override req_type = ReqType.LIMIT;

    override get reqId() { return super.reqId as `${typeof Limit.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}