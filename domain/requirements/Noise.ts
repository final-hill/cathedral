import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Property that is in requirements but should not be
 */
@Entity({ discriminatorValue: ReqType.NOISE })
export class Noise extends Requirement {
    static override req_type: ReqType = ReqType.NOISE;
}