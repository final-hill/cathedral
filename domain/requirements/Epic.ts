import { Entity } from "@mikro-orm/core";
import { Scenario } from "./Scenario.js";
import { ReqType } from "./ReqType.js";

export const epicReqIdPrefix = 'G.5.' as const;
export type EpicReqId = `${typeof epicReqIdPrefix}${number}`;

/**
 * An Epic is a collection of Use Cases and User Stories all directed towards a common goal.
 * Ex: "decrease the percentage of of fraudulent sellers by 20%"
 */
@Entity({ discriminatorValue: ReqType.EPIC })
export class Epic extends Scenario {
    constructor(props: Omit<Epic, 'id' | 'req_type'>) {
        super(props);
        this.req_type = ReqType.EPIC;
    }

    override get reqId(): EpicReqId | undefined { return super.reqId as EpicReqId | undefined }
    override set reqId(value: EpicReqId | undefined) { super.reqId = value }
}