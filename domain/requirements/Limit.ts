import { Requirement } from "./Requirement.js";

/**
 * An Exclusion from the scope of requirements
 */
export class Limit extends Requirement {
    static override readonly reqIdPrefix = 'G.6.' as const;

    override get reqId() { return super.reqId as `${typeof Limit.reqIdPrefix}${number}` | undefined }
}