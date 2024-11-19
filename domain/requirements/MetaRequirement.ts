import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Property of requirements themselves (not of the Project, Environment, Goals, or System)
 */
@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirement extends Requirement {
    static override req_type: ReqType = ReqType.META_REQUIREMENT;
}