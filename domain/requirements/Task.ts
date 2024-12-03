import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Activity included in the project
 */
export class Task extends Requirement {
    static override req_type: ReqType = ReqType.TASK;
}
