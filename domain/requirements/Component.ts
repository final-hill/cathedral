import { Actor } from "./Actor.js";
import { ReqType } from "./ReqType.js";

/**
 * Idenfitication of a part (of the Project, Environment, Goals, or System)
 */
export class Component extends Actor {
    static override req_type: ReqType = ReqType.COMPONENT;
}
