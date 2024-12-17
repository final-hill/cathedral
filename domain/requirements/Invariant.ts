import { Requirement } from "./Requirement.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
export class Invariant extends Requirement {
    static override readonly reqIdPrefix = 'E.6.' as const;

    override get reqId() { return super.reqId as `${typeof Invariant.reqIdPrefix}${number}` | undefined }
}