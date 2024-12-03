import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";

/**
 * Illustration of behavior through a usage scenario
 */
export class Example extends Behavior {
    static override req_type: ReqType = ReqType.EXAMPLE;
}