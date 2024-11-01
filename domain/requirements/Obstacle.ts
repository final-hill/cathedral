import { Entity } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

export const obstacleReqIdPrefix = 'G.2.' as const;
export type ObstacleReqId = `${typeof obstacleReqIdPrefix}${number}`;

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class Obstacle extends Goal {
    constructor(props: Properties<Omit<Obstacle, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.OBSTACLE;
    }

    override get reqId(): ObstacleReqId | undefined { return super.reqId as ObstacleReqId | undefined }
    override set reqId(value: ObstacleReqId | undefined) { super.reqId = value }
}