import { Requirement } from "./Requirement.js";

export type AssumptionReqId = `${typeof Assumption.reqIdPrefix}${number}`;

/**
 * Posited property of the environment
 */
export class Assumption extends Requirement {
    static override readonly reqIdPrefix = 'E.4.' as const;

    override get reqId() {
        return super.reqId as `${typeof Assumption.reqIdPrefix}${number}` | undefined
    }
}