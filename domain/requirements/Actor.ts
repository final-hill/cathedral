import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * A part of a Project, Environment, System, or Goals that may affect or be affected by the associated entities
 */
@Entity({ discriminatorValue: ReqType.ACTOR })
export class Actor extends Requirement {
    static override req_type: ReqType = ReqType.ACTOR;
}