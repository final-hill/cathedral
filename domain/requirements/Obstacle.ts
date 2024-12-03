import { Goal } from "./Goal.js";
import { ReqType } from "./ReqType.js";

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
export class Obstacle extends Goal {
    static override reqIdPrefix = 'G.2.' as const;
    static override req_type: ReqType = ReqType.OBSTACLE;

    override get reqId() { return super.reqId as `${typeof Obstacle.reqIdPrefix}${number}` | undefined }
    override set reqId(value) { super.reqId = value }
}