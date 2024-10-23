import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Artifact needed or produced by a task
 */
@Entity({ discriminatorValue: ReqType.PRODUCT })
export class Product extends Requirement {
    constructor(props: Properties<Omit<Product, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.PRODUCT
    }
}