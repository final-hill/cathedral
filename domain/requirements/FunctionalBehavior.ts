import { Entity } from "@mikro-orm/core";
import { Functionality } from "./Functionality.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * FunctionalBehavior specifies **what** behavior the system should exhibit, i.e.,
 * the results or effects of the system's operation.
 * Generally expressed in the form "system must do <requirement>"
 */
@Entity({ discriminatorValue: ReqType.FUNCTIONAL_BEHAVIOR })
export class FunctionalBehavior extends Functionality {
    constructor(props: Properties<Omit<FunctionalBehavior, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.FUNCTIONAL_BEHAVIOR;
    }
}