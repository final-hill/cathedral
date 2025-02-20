import { Requirement } from "./Requirement.js";

/**
 * Environment property affected by the system
 */
export class Effect extends Requirement {
    static override readonly reqIdPrefix = 'E.5.' as const;

    override get reqId() { return super.reqId as `${typeof Effect.reqIdPrefix}${number}` | undefined }
}