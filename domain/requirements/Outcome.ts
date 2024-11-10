import { Entity } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A result desired by an organization
 */
@Entity({ discriminatorValue: ReqType.OUTCOME })
export class Outcome extends Goal {
    // FIXME: The Context and overall objective entry is an Outcome, but the req_id is G.1.0
    static override reqIdPrefix = 'G.3.' as const;

    constructor(props: Properties<Omit<Outcome, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.OUTCOME;
    }

    override get reqId() { return super.reqId as `${typeof Outcome.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}