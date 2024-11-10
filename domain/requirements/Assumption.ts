import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import type { Properties } from "../types/index.js";

export type AssumptionReqId = `${typeof Assumption.reqIdPrefix}${number}`;

/**
 * Posited property of the environment
 */
@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class Assumption extends Requirement {
    static override reqIdPrefix = 'E.4.' as const;

    constructor(props: Properties<Omit<Assumption, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.ASSUMPTION;
    }

    override get reqId() { return super.reqId as `${typeof Assumption.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}