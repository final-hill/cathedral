import { Entity } from "@mikro-orm/core";
import { Actor } from "./Actor.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Idenfitication of a part (of the Project, Environment, Goals, or System)
 */
@Entity({ abstract: true, discriminatorValue: ReqType.COMPONENT })
export abstract class Component extends Actor {
    constructor(props: Properties<Omit<Component, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.COMPONENT
    }
}
