import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Environment property affected by the system
 */
@Entity({ discriminatorValue: ReqType.EFFECT })
export class Effect extends Requirement {
    static override reqIdPrefix = 'E.5.' as const;
    static override req_type = ReqType.EFFECT;

    override get reqId() { return super.reqId as `${typeof Effect.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}