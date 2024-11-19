import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Activity included in the project
 */
@Entity({ discriminatorValue: ReqType.TASK })
export class Task extends Requirement {
    static override req_type: ReqType = ReqType.TASK;
}
