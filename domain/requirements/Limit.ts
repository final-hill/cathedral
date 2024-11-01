import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const limitReqIdPrefix = 'G.6.' as const;
export type LimitReqId = `${typeof limitReqIdPrefix}${number}`;

/**
 * An Exclusion from the scope of requirements
 */
@Entity({ discriminatorValue: ReqType.LIMIT })
export class Limit extends Requirement {
    constructor(props: Properties<Omit<Limit, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.LIMIT;
    }

    override get reqId(): LimitReqId | undefined { return super.reqId as LimitReqId | undefined }
    override set reqId(value: LimitReqId | undefined) { super.reqId = value }
}