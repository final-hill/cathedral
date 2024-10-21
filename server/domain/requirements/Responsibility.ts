import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Assignment of behavior or task to a component
 */
@Entity({ discriminatorValue: ReqType.RESPONSIBILITY })
export class Responsibility extends Requirement {
    constructor(props: Properties<Omit<Responsibility, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.RESPONSIBILITY
    }
}
