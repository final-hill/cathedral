import { Functionality } from "./Functionality.js";
import { ReqType } from "./ReqType.js";

/**
 * FunctionalBehavior specifies **what** behavior the system should exhibit, i.e.,
 * the results or effects of the system's operation.
 * Generally expressed in the form "system must do <requirement>"
 */
export class FunctionalBehavior extends Functionality {
    static override reqIdPrefix = 'S.2.' as const;
    static override req_type = ReqType.FUNCTIONAL_BEHAVIOR;

    override get reqId() { return super.reqId as `${typeof FunctionalBehavior.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}