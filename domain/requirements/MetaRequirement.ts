import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Property of requirements themselves (not of the Project, Environment, Goals, or System)
 */
export class MetaRequirement extends Requirement {
    static override req_type: ReqType = ReqType.META_REQUIREMENT;
}