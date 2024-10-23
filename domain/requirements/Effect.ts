import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Environment property affected by the system
 */
@Entity({ discriminatorValue: ReqType.EFFECT })
export class Effect extends Requirement {
    constructor(props: Properties<Omit<Effect, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.EFFECT;
    }
}