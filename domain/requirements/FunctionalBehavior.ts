import { Functionality } from "./Functionality.js";

/**
 * FunctionalBehavior specifies **what** behavior the system should exhibit, i.e.,
 * the results or effects of the system's operation.
 * Generally expressed in the form "system must do <requirement>"
 */
export class FunctionalBehavior extends Functionality {
    static override readonly reqIdPrefix = 'S.2.' as const;

    override get reqId() { return super.reqId as `${typeof FunctionalBehavior.reqIdPrefix}${number}` | undefined }
}