import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";

/**
 * Functionality describes what system will do and how it will do it.
 */
@Entity({ discriminatorValue: ReqType.FUNCTIONALITY })
export class Functionality extends Behavior {
    static override req_type: ReqType = ReqType.FUNCTIONALITY;
}