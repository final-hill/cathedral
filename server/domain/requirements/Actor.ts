import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * A part of a Project, Environment, System, or Goals that may affect or be affected by the associated entities
 */
@Entity({ abstract: true, discriminatorValue: ReqType.ACTOR })
export abstract class Actor extends Requirement {
    constructor(props: Properties<Omit<Actor, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.ACTOR
    }
}
