import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Posited property of the environment
 */
@Entity({ discriminatorValue: ReqType.ASSUMPTION })
export class Assumption extends Requirement {
    constructor(props: Properties<Omit<Assumption, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.ASSUMPTION;
    }
}