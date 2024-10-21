import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Illustration of behavior through a usage scenario
 */
@Entity({ abstract: true, discriminatorValue: ReqType.EXAMPLE })
export abstract class Example extends Behavior {
    constructor(props: Properties<Omit<Example, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.EXAMPLE
    }
}
