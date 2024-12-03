import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Property that is in requirements but should not be
 */
export class Noise extends Requirement {
    static override req_type: ReqType = ReqType.NOISE;
}