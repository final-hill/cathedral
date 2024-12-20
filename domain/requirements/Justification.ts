import { Entity } from "@mikro-orm/core";
import { MetaRequirement } from "./MetaRequirement.js";
import { ReqType } from "./ReqType.js";

/**
 * Explanation of a project or system property in reference to a goal or environment property.
 * A requirement is justified if it helps to achieve a goal or to satisfy an environment property (constraint).
 */
@Entity({ discriminatorValue: ReqType.JUSTIFICATION })
export class Justification extends MetaRequirement {
    static override req_type: ReqType = ReqType.JUSTIFICATION;
}