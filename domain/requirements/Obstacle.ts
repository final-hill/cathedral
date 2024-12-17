import { Goal } from "./Goal.js";

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
export class Obstacle extends Goal {
    static override readonly reqIdPrefix = 'G.2.' as const;

    override get reqId() { return super.reqId as `${typeof Obstacle.reqIdPrefix}${number}` | undefined }
}