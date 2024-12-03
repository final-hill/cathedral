import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Assignment of behavior or task to a component
 */
export class Responsibility extends Requirement {
    static override req_type: ReqType = ReqType.RESPONSIBILITY;
}
