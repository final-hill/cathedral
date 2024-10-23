import { Entity } from "@mikro-orm/core";
import { Goal } from "./Goal.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * A result desired by an organization
 */
@Entity({ discriminatorValue: ReqType.OUTCOME })
export class Outcome extends Goal {
    constructor(props: Properties<Omit<Outcome, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.OUTCOME;
    }
}