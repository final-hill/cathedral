import { Functionality } from "./Functionality.js";

/**
 * NonFunctionalBehavior is a type of Behavior that is not directly related to the functionality of a system.
 * It specifies **how** the system should behave, i.e., the qualities that the system must exhibit.
 * Generally expressed in the form "system shall be <requirement>."
 */
export class NonFunctionalBehavior extends Functionality {
    static override readonly reqIdPrefix = 'S.2.' as const;

    override get reqId() { return super.reqId as `${typeof NonFunctionalBehavior.reqIdPrefix}${number}` | undefined }
}