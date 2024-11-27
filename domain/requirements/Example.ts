import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";

/**
 * Illustration of behavior through a usage scenario
 */
@Entity({ discriminatorValue: ReqType.EXAMPLE })
export class Example extends Behavior {
    static override req_type: ReqType = ReqType.EXAMPLE;
}