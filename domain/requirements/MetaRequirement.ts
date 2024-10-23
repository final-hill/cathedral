import { Entity } from "@mikro-orm/core";
import { Requirement } from "./Requirement.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * Property of requirements themselves (not of the Project, Environment, Goals, or System)
 */
@Entity({ discriminatorValue: ReqType.META_REQUIREMENT })
export class MetaRequirement extends Requirement {
    constructor(props: Properties<Omit<MetaRequirement, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.META_REQUIREMENT
    }
}