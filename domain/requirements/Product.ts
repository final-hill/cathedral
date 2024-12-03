import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Artifact needed or produced by a task
 */
export class Product extends Requirement {
    static override req_type: ReqType = ReqType.PRODUCT;
}