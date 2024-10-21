import { Entity } from "@mikro-orm/core";
import { Behavior } from "./Behavior.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Functionality describes what system will do and how it will do it.
 */
@Entity({ abstract: true, discriminatorValue: ReqType.FUNCTIONALITY })
export abstract class Functionality extends Behavior {
    constructor(props: Properties<Omit<Functionality, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.FUNCTIONALITY
    }
}