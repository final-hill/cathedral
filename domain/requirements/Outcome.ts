import { Entity } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

// FIXME: The Context and overall objective entry is an Outcome, but the req_id is G.1.0
export const outcomeReqIdPrefix = 'G.3.' as const;
export type OutcomeReqId = `${typeof outcomeReqIdPrefix}${number}`;

/**
 * A result desired by an organization
 */
@Entity({ discriminatorValue: ReqType.OUTCOME })
export class Outcome extends Goal {
    constructor(props: Properties<Omit<Outcome, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.OUTCOME;
    }

    override get reqId(): OutcomeReqId | undefined { return super.reqId as OutcomeReqId | undefined }
    override set reqId(value: OutcomeReqId | undefined) { super.reqId = value }
}