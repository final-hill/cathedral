import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Artifact needed or produced by a task
 */
@Entity({ discriminatorValue: ReqType.PRODUCT })
export class Product extends Requirement {
    static override req_type: ReqType = ReqType.PRODUCT;
}