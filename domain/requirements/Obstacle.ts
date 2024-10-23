import { Entity } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Obstacles are the challenges that prevent the goals from being achieved.
 */
@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class Obstacle extends Goal {
    constructor(props: Properties<Omit<Obstacle, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.OBSTACLE;
    }
}