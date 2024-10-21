import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Property that is in requirements but should not be
 */
@Entity({ discriminatorValue: ReqType.NOISE })
export class Noise extends Requirement {
    constructor(props: Properties<Omit<Noise, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.NOISE
    }
}