import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
export class Invariant extends Requirement {
    static override reqIdPrefix = 'E.6.' as const;
    static override req_type: ReqType = ReqType.INVARIANT;

    constructor(props: ConstructorParameters<typeof Requirement>[0]) {
        super(props);
        this.req_type = ReqType.INVARIANT;
    }

    override get reqId() { return super.reqId as `${typeof Invariant.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}