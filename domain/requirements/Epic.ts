import { Entity } from "@mikro-orm/core";
import { Scenario } from "./Scenario.js";
import { ReqType } from "./ReqType.js";

/**
 * An Epic is a collection of Use Cases and User Stories all directed towards a common goal.
 * Ex: "decrease the percentage of of fraudulent sellers by 20%"
 */
@Entity({ discriminatorValue: ReqType.EPIC })
export class Epic extends Scenario {
    static override reqIdPrefix = 'G.5.' as const;

    constructor(props: Omit<Epic, 'id' | 'req_type'>) {
        super(props);
        this.req_type = ReqType.EPIC;
    }

    override get reqId() { return super.reqId as `${typeof Epic.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}