import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Environment property that must be maintained.
 * It exists as both an assumption and an effect.
 * (precondition and postcondition)
 */
@Entity({ discriminatorValue: ReqType.INVARIANT })
export class Invariant extends Requirement {
    constructor(props: Properties<Omit<Invariant, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.INVARIANT;
    }
}