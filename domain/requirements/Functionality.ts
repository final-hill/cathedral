import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";

/**
 * Functionality describes what system will do and how it will do it.
 */
export class Functionality extends Behavior {
    static override req_type: ReqType = ReqType.FUNCTIONALITY;
}