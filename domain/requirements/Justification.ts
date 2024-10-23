import { Entity } from "@mikro-orm/core";
import { MetaRequirement } from "./MetaRequirement.js";
import { type Properties } from "../types/index.js";
import { ReqType } from "./ReqType.js";

/**
 * Explanation of a project or system property in reference to a goal or environment property
 */
@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class Justification extends MetaRequirement {
    constructor(props: Properties<Omit<Justification, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.JUSTIFICATION;
    }
}