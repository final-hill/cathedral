import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";

/**
 * Illustration of behavior through a usage scenario
 */
@Entity({ abstract: true, discriminatorValue: ReqType.EXAMPLE })
export abstract class Example extends Behavior {
    static override req_type: ReqType = ReqType.EXAMPLE;
}
