import { Goal } from "./Goal.js";

/**
 * A result desired by an organization
 */
export class Outcome extends Goal {
    // FIXME: The Context and overall objective entry is an Outcome, but the req_id is G.1.0
    static override readonly reqIdPrefix = 'G.3.' as const;

    override get reqId() { return super.reqId as `${typeof Outcome.reqIdPrefix}${number}` | undefined }
}