import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * A result desired by an organization.
 * an objective of the project or system, in terms
 * of their desired effect on the environment
 */
@Entity({ discriminatorValue: ReqType.GOAL })
export class Goal extends Requirement {
    static override req_type: ReqType = ReqType.GOAL;
}